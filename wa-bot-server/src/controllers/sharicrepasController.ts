import { DatabaseConnection } from '../database/connection';
import { logger } from '../utils/logger';
import { analyzeOrderProducts } from './productAnalyzer';

export interface SharicrepasCustomer {
  id?: number;
  phoneNumber: string;
  name?: string;
  preferredName?: string;
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: string[];
  lastOrderDate?: Date;
  customerSince: Date;
  isVip: boolean;
  notes?: string;
  isActive: boolean;
}

export interface SharicrepasOrder {
  id?: number;
  orderNumber: string;
  phoneNumber: string;
  customerName?: string;
  orderDetails: string;
  orderType: 'whatsapp' | 'phone' | 'walk-in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  estimatedTime?: number;
  totalAmount?: number;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationSession {
  id?: number;
  phoneNumber: string;
  currentScreen: string;
  sessionData: any;
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export class SharicrepasController {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection();
  }

  /**
   * Registra o actualiza un cliente de Sharicrepas
   */
  async registerCustomer(phoneNumber: string, name?: string): Promise<SharicrepasCustomer | null> {
    try {
      const cleanPhone = phoneNumber.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      
      const query = `
        INSERT INTO sharicrepas_customers (phone_number, name, preferred_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (phone_number) 
        DO UPDATE SET 
          updated_at = CURRENT_TIMESTAMP,
          name = COALESCE(EXCLUDED.name, sharicrepas_customers.name)
        RETURNING *;
      `;
      
      const result = await this.db.query(query, [cleanPhone, name, name]);
      const customer = result.rows[0];
      
      logger.info(`🏪 Cliente Sharicrepas registrado: ${cleanPhone}`);
      return this.mapCustomerFromDB(customer);
    } catch (error) {
      logger.error('Error registering Sharicrepas customer:', error);
      return null;
    }
  }

  /**
   * Obtiene información del cliente
   */
  async getCustomer(phoneNumber: string): Promise<SharicrepasCustomer | null> {
    try {
      const cleanPhone = phoneNumber.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      
      const query = `
        SELECT * FROM sharicrepas_customers 
        WHERE phone_number = $1 AND is_active = true;
      `;
      
      const result = await this.db.query(query, [cleanPhone]);
      if (result.rows.length === 0) return null;
      
      return this.mapCustomerFromDB(result.rows[0]);
    } catch (error) {
      logger.error('Error getting customer:', error);
      return null;
    }
  }

  /**
   * Guarda un mensaje con intención detectada
   */
  async saveMessage(phoneNumber: string, direction: 'incoming' | 'outgoing', 
                   messageText: string, intent?: string, responseTimeMs?: number): Promise<boolean> {
    try {
      const cleanPhone = phoneNumber.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      const timestamp = Date.now();
      const messageId = `${direction}_${timestamp}_${cleanPhone}`;
      
      // Asegurar que el cliente existe
      await this.registerCustomer(cleanPhone);
      
      const query = `
        INSERT INTO sharicrepas_messages 
        (message_id, phone_number, direction, message_text, intent, response_time_ms, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      
      await this.db.query(query, [
        messageId, cleanPhone, direction, messageText, intent, responseTimeMs, timestamp
      ]);
      
      // Actualizar actividad del cliente
      await this.updateCustomerActivity(cleanPhone);
      
      return true;
    } catch (error) {
      logger.error('Error saving message:', error);
      return false;
    }
  }

  /**
   * Crea un nuevo pedido
   */
  async createOrder(orderData: Partial<SharicrepasOrder>): Promise<SharicrepasOrder | null> {
    try {
      const cleanPhone = orderData.phoneNumber!.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      
      // Generar número de orden único
      const today = new Date();
      const dateStr = today.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
      const orderNumber = `SH${dateStr}${String(Date.now()).slice(-3)}`;
      
      const query = `
        INSERT INTO sharicrepas_orders 
        (order_number, phone_number, customer_name, order_details, order_type, 
         estimated_time, total_amount, special_instructions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      
      const values = [
        orderNumber,
        cleanPhone,
        orderData.customerName,
        orderData.orderDetails,
        orderData.orderType || 'whatsapp',
        orderData.estimatedTime || 20,
        orderData.totalAmount,
        orderData.specialInstructions
      ];
      
      const result = await this.db.query(query, values);
      const order = result.rows[0];
      
      // Actualizar estadísticas del cliente
      await this.updateCustomerOrderStats(cleanPhone);
      
      // Analizar productos del pedido para analytics
      await analyzeOrderProducts(orderNumber, orderData.orderDetails!);
      
      logger.info(`📝 Pedido creado: ${orderNumber} para ${cleanPhone}`);
      return this.mapOrderFromDB(order);
    } catch (error) {
      logger.error('Error creating order:', error);
      return null;
    }
  }

  /**
   * Actualiza el estado de un pedido
   */
  async updateOrderStatus(orderNumber: string, status: SharicrepasOrder['status']): Promise<boolean> {
    try {
      const query = `
        UPDATE sharicrepas_orders 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE order_number = $2;
      `;
      
      await this.db.query(query, [status, orderNumber]);
      logger.info(`📋 Pedido ${orderNumber} actualizado a: ${status}`);
      return true;
    } catch (error) {
      logger.error('Error updating order status:', error);
      return false;
    }
  }

  /**
   * Gestiona sesiones de conversación
   */
  async updateConversationSession(phoneNumber: string, currentScreen: string, sessionData?: any): Promise<boolean> {
    try {
      const cleanPhone = phoneNumber.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      
      const query = `
        INSERT INTO conversation_sessions (phone_number, current_screen, session_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (phone_number) 
        DO UPDATE SET 
          current_screen = $2,
          session_data = $3,
          last_activity = CURRENT_TIMESTAMP;
      `;
      
      await this.db.query(query, [cleanPhone, currentScreen, JSON.stringify(sessionData || {})]);
      return true;
    } catch (error) {
      logger.error('Error updating conversation session:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas del día
   */
  async getTodayStats(): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const conversationsQuery = `
        SELECT COUNT(DISTINCT phone_number) as total_conversations
        FROM sharicrepas_messages 
        WHERE DATE(created_at) = $1;
      `;
      
      const ordersQuery = `
        SELECT COUNT(*) as total_orders, 
               COALESCE(AVG(total_amount), 0) as avg_amount
        FROM sharicrepas_orders 
        WHERE DATE(created_at) = $1;
      `;
      
      const [conversationsResult, ordersResult] = await Promise.all([
        this.db.query(conversationsQuery, [today]),
        this.db.query(ordersQuery, [today])
      ]);
      
      const conversations = parseInt(conversationsResult.rows[0].total_conversations) || 0;
      const orders = parseInt(ordersResult.rows[0].total_orders) || 0;
      const avgAmount = parseFloat(ordersResult.rows[0].avg_amount) || 0;
      const conversionRate = conversations > 0 ? (orders / conversations * 100) : 0;
      
      return {
        date: today,
        totalConversations: conversations,
        totalOrders: orders,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageOrderAmount: Math.round(avgAmount * 100) / 100
      };
    } catch (error) {
      logger.error('Error getting today stats:', error);
      return null;
    }
  }

  /**
   * Obtiene los productos más solicitados
   */
  async getPopularProducts(days: number = 7): Promise<any[]> {
    try {
      const query = `
        SELECT order_details, COUNT(*) as frequency
        FROM sharicrepas_orders 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY order_details
        ORDER BY frequency DESC
        LIMIT 10;
      `;
      
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting popular products:', error);
      return [];
    }
  }

  // Métodos auxiliares privados
  private mapCustomerFromDB(row: any): SharicrepasCustomer {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      name: row.name,
      preferredName: row.preferred_name,
      totalOrders: row.total_orders || 0,
      totalSpent: parseFloat(row.total_spent) || 0,
      favoriteProducts: row.favorite_products || [],
      lastOrderDate: row.last_order_date,
      customerSince: row.customer_since,
      isVip: row.is_vip || false,
      notes: row.notes,
      isActive: row.is_active
    };
  }

  private mapOrderFromDB(row: any): SharicrepasOrder {
    return {
      id: row.id,
      orderNumber: row.order_number,
      phoneNumber: row.phone_number,
      customerName: row.customer_name,
      orderDetails: row.order_details,
      orderType: row.order_type,
      status: row.status,
      estimatedTime: row.estimated_time,
      totalAmount: parseFloat(row.total_amount) || 0,
      paymentMethod: row.payment_method,
      specialInstructions: row.special_instructions,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private async updateCustomerActivity(phoneNumber: string): Promise<void> {
    const query = `
      UPDATE sharicrepas_customers 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE phone_number = $1;
    `;
    await this.db.query(query, [phoneNumber]);
  }

  private async updateCustomerOrderStats(phoneNumber: string): Promise<void> {
    const query = `
      UPDATE sharicrepas_customers 
      SET 
        total_orders = total_orders + 1,
        last_order_date = CURRENT_TIMESTAMP,
        is_vip = CASE WHEN total_orders + 1 >= 10 THEN true ELSE is_vip END
      WHERE phone_number = $1;
    `;
    await this.db.query(query, [phoneNumber]);
  }
}
