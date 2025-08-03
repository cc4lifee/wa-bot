import { DatabaseConnection } from '../database/connection';
import { ChatMessage, User } from '@common/index';

export class BotController {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection();
  }

  /**
   * Guarda un mensaje entrante de WhatsApp en la base de datos
   */
  public async saveIncomingMessage(from: string, text: string): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const messageId = `incoming_${timestamp}_${from.replace(/[^0-9]/g, '')}`;
      
      const dbQuery = `
        INSERT INTO chat_messages (message_id, from_user, to_user, message_text, message_type, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const values = [
        messageId,
        from,
        'bot', // el bot recibe el mensaje
        text,
        'text',
        timestamp
      ];

      await this.db.query(dbQuery, values);
      console.log(`💾 Mensaje guardado de ${from}: ${text}`);
      return true;
    } catch (error) {
      console.error('Error saving incoming message:', error);
      return false;
    }
  }

  /**
   * Guarda un mensaje saliente del bot en la base de datos
   */
  public async saveOutgoingMessage(to: string, text: string): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const messageId = `outgoing_${timestamp}_${to.replace(/[^0-9]/g, '')}`;
      
      const dbQuery = `
        INSERT INTO chat_messages (message_id, from_user, to_user, message_text, message_type, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const values = [
        messageId,
        'bot',
        to,
        text,
        'text',
        timestamp
      ];

      await this.db.query(dbQuery, values);
      console.log(`📤 Respuesta guardada para ${to}: ${text}`);
      return true;
    } catch (error) {
      console.error('Error saving outgoing message:', error);
      return false;
    }
  }

  /**
   * Registra o actualiza un usuario basado en su número de WhatsApp
   */
  public async registerWhatsAppUser(phoneNumber: string, name?: string): Promise<User | null> {
    try {
      // Limpiar el número de teléfono (quitar @s.whatsapp.net, etc.)
      const cleanPhone = phoneNumber.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      
      const dbQuery = `
        INSERT INTO users (phone_number, name, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (phone_number) 
        DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      
      const result = await this.db.query(dbQuery, [cleanPhone, name || null, 'user']);
      const user = result.rows[0];
      
      const userData: User = {
        id: user.id,
        name: user.name,
        phoneNumber: user.phone_number,
        isActive: user.is_active
      };

      console.log(`👤 Usuario registrado: ${cleanPhone}`);
      return userData;
    } catch (error) {
      console.error('Error registering WhatsApp user:', error);
      return null;
    }
  }

  /**
   * Obtiene el conteo de mensajes del día actual
   */
  public async getTodayMessageCount(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();
      
      const dbQuery = `
        SELECT COUNT(*) as count 
        FROM chat_messages 
        WHERE timestamp >= $1;
      `;
      
      const result = await this.db.query(dbQuery, [todayTimestamp]);
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  /**
   * Obtiene los últimos mensajes de un usuario específico
   */
  public async getUserLastMessages(phoneNumber: string, limit: number = 5): Promise<ChatMessage[]> {
    try {
      const cleanPhone = phoneNumber.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      
      const dbQuery = `
        SELECT * FROM chat_messages 
        WHERE from_user = $1 OR to_user = $1
        ORDER BY created_at DESC 
        LIMIT $2;
      `;
      
      const result = await this.db.query(dbQuery, [cleanPhone, limit]);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        from: row.from_user,
        to: row.to_user,
        text: row.message_text,
        timestamp: row.timestamp
      }));
    } catch (error) {
      console.error('Error getting user last messages:', error);
      return [];
    }
  }

  /**
   * Marca un usuario como activo (útil para analytics)
   */
  public async markUserAsActive(phoneNumber: string): Promise<boolean> {
    try {
      const cleanPhone = phoneNumber.replace(/@.*$/, '').replace(/[^0-9]/g, '');
      
      const dbQuery = `
        UPDATE users 
        SET updated_at = CURRENT_TIMESTAMP, is_active = true
        WHERE phone_number = $1;
      `;
      
      await this.db.query(dbQuery, [cleanPhone]);
      return true;
    } catch (error) {
      console.error('Error marking user as active:', error);
      return false;
    }
  }
}
