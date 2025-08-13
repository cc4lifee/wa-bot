import makeWASocket, { DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { SharicrepasController } from '../controllers/sharicrepasController';
import { SharicrepasMessages } from './messages';
import { SharicrepasConfig, isBusinessOpen, getTimeBasedGreeting } from './config';
import { logger } from '../utils/logger';

export class SharicrepasBot {
  private sock: WASocket | null = null;
  private sharicrepasController: SharicrepasController;
  private customerStates: Map<string, CustomerState> = new Map();

  constructor() {
    this.sharicrepasController = new SharicrepasController();
  }

  /**
   * Inicia el bot de WhatsApp para Sharicrepas
   */
  public async start() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('auth');

      this.sock = makeWASocket({
        auth: state,
      });

      // Mostrar QR cuando esté disponible
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('\n🤖 Escanea este QR con WhatsApp para conectar Sharicrepas:');
          qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          logger.info('Conexión cerrada:', lastDisconnect?.error);
          if (shouldReconnect) {
            logger.info('Reconectando...');
            this.start();
          }
        } else if (connection === 'open') {
          console.log('🌟 ¡Sharicrepas WhatsApp Bot conectado exitosamente! 🌟');
          logger.info('Sharicrepas bot connected successfully');
        }
      });

      // Guardar credenciales cuando cambien
      this.sock.ev.on('creds.update', saveCreds);

      // Manejar mensajes recibidos
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' || !messages || !messages[0]?.message) {
          return;
        }
        
        const msg = messages[0];
        const sender = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        if (text && sender && !msg.key.fromMe) {
          console.log(`📱 Mensaje recibido de ${sender}: ${text}`);
          
          try {
            // 1. Registrar cliente si no existe
            await this.sharicrepasController.registerCustomer(sender);
            
            // 2. Procesar mensaje y responder (con tracking mejorado)
            const startTime = Date.now();
            await this.processMessage(sender, text);
            const responseTime = Date.now() - startTime;
            
            // 3. Guardar mensaje con intención detectada
            const intent = this.detectIntent(text);
            await this.sharicrepasController.saveMessage(sender, 'incoming', text, intent, responseTime);
            
          } catch (error) {
            logger.error('Error procesando mensaje:', error);
            await this.sendMessage(sender, 'Lo siento, hubo un error. Intenta de nuevo o llámanos al 6862584142');
          }
        }
      });

    } catch (error) {
      logger.error('Error iniciando Sharicrepas bot:', error);
      console.error('❌ Error iniciando Sharicrepas bot:', error);
    }
  }

  /**
   * Procesa mensajes entrantes y responde según el contexto
   */
  private async processMessage(userId: string, message: string): Promise<void> {
    const lowerMessage = message.toLowerCase().trim();
    const state = this.getCustomerState(userId);
    
    let response: string;

    // Comandos principales
    if (this.isGreeting(lowerMessage)) {
      await this.updateConversationState(userId, 'welcome');
      
      // Verificar si estamos abiertos
      if (!isBusinessOpen()) {
        response = SharicrepasMessages.getOutOfHoursMessage();
      } else {
        response = `${getTimeBasedGreeting()}\n\n${SharicrepasMessages.getWelcomeMessage()}`;
      }
      
    } else if (this.isMenuRequest(lowerMessage)) {
      await this.updateConversationState(userId, 'welcome');
      response = SharicrepasMessages.getMenuMessage();
      
    } else if (this.isOrderRequest(lowerMessage)) {
      await this.updateConversationState(userId, 'ordering');
      response = SharicrepasMessages.getOrderMessage();
      
    } else if (this.isLocationRequest(lowerMessage)) {
      response = SharicrepasMessages.getLocationMessage();
      
    } else if (this.isScheduleRequest(lowerMessage)) {
      response = SharicrepasMessages.getScheduleMessage();
      
    } else if (this.isContactRequest(lowerMessage)) {
      response = SharicrepasMessages.getContactMessage();
      
    } else if (this.isHelpRequest(lowerMessage)) {
      response = SharicrepasMessages.getHelpMessage();
      
    } else {
      // Manejo de estados de conversación
      switch (state.currentScreen) {
        case 'ordering':
          response = this.handleOrderProcess(userId, message);
          break;
          
        case 'taking_order':
          response = await this.handleOrderTaking(userId, message);
          break;
          
        default:
          response = this.handleUnknownCommand(message);
          break;
      }
    }

    // Enviar respuesta
    await this.sendMessage(userId, response);
  }

  /**
   * Maneja el proceso de pedido
   */
  private handleOrderProcess(userId: string, message: string): string {
    const state = this.getCustomerState(userId);
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage.includes('catálogo') || lowerMessage.includes('catalogo') || message === '1') {
      return `🛒 *Perfecto! Usa nuestro catálogo:*
      
👉 https://wa.me/c/5216862584142

💡 *Ahí puedes:*
• Ver todas las fotos
• Leer descripciones completas  
• Ver precios actualizados
• Hacer tu pedido directamente

Una vez que hagas tu pedido, ¡te confirmaremos todo! 😊`;

    } else if (lowerMessage.includes('dime') || lowerMessage.includes('ayudo') || message === '2') {
      state.currentScreen = 'taking_order';
      return `📝 *¡Perfecto! Te ayudo a tomar tu pedido*

*🍽️ ¿Qué te gustaría ordenar?*

Tenemos:
• 🥞 Crepas dulces y saladas
• 🧇 Waffles
• ☕ Bebidas (cafés, frappes)
• 🍔 Hamburguesas y hot dogs
• 🍗 Boneless y nachos
• 🍟 Papas y aros
• 🍢 Banderillas coreanas
• 🍽️ Charolas especiales

*Escribe tu pedido:*`;

    } else if (lowerMessage.includes('llamar') || lowerMessage.includes('llamo') || message === '3') {
      return `📞 *¡Excelente opción!*

*Llámanos directamente:*
📱 6862584142

*Horario de atención:*
🕒 Jueves a martes: 4:00 pm - 11:00 pm
🔒 Cerrado los miércoles

¡Te atenderemos con mucho gusto! 😊`;

    } else {
      return `❓ *No entendí tu opción*

*Elige una opción:*
1️⃣ Usar catálogo online
2️⃣ Que te ayude a tomar el pedido
3️⃣ Llamar por teléfono

O escribe *"menu"* para ver qué vendemos`;
    }
  }

  /**
   * Maneja la toma de pedido personalizada
   */
  private async handleOrderTaking(userId: string, message: string): Promise<string> {
    const state = this.getCustomerState(userId);
    
    if (!state.customerName) {
      // Asumir que el primer mensaje es el pedido
      state.orderDetails = message;
      await this.updateConversationState(userId, 'taking_order', { orderDetails: message });
      return `✅ *Anotado tu pedido:*
"${message}"

👤 *¿Cómo te llamas?*
(Para confirmar tu pedido)`;
      
    } else if (!state.isConfirmed) {
      // El usuario ya dio su nombre, confirmar pedido
      state.customerName = message;
      state.isConfirmed = true;
      
      try {
        // Crear pedido en la base de datos
        const orderData = {
          phoneNumber: userId,
          customerName: state.customerName,
          orderDetails: state.orderDetails || 'Pedido personalizado',
          orderType: 'whatsapp' as const,
          estimatedTime: 20
        };
        
        const order = await this.sharicrepasController.createOrder(orderData);
        
        if (order) {
          // Actualizar estado del cliente con número de pedido
          await this.updateConversationState(userId, 'completed', { 
            orderNumber: order.orderNumber,
            isConfirmed: true 
          });
          
          const confirmationMessage = SharicrepasMessages.getOrderConfirmationMessage(
            state.customerName,
            state.orderDetails || 'Pedido personalizado'
          );
          
          // Resetear estado local después de confirmar
          this.resetCustomerState(userId);
          
          return confirmationMessage + `\n\n📋 *Número de pedido:* ${order.orderNumber}`;
        } else {
          return `❌ Hubo un error procesando tu pedido. Por favor llámanos al 6862584142`;
        }
        
      } catch (error) {
        logger.error('Error creating order:', error);
        return `❌ Hubo un error procesando tu pedido. Por favor llámanos al 6862584142`;
      }
    }
    
    return SharicrepasMessages.getHelpMessage();
  }

  /**
   * Maneja comandos no reconocidos
   */
  private handleUnknownCommand(message: string): string {
    return `❓ *No entendí tu mensaje*

*💡 Prueba con:*
• *"hola"* - Para empezar
• *"menu"* - Ver nuestro catálogo  
• *"pedido"* - Hacer un pedido
• *"ubicacion"* - Dónde estamos
• *"horarios"* - Cuándo abrimos
• *"ayuda"* - Ver todas las opciones

O simplemente dime qué necesitas de forma natural 😊

*📱 También puedes:*
• Ver catálogo: https://wa.me/c/5216862584142
• Llamarnos: 6862584142`;
  }

  /**
   * Envía mensaje por WhatsApp
   */
  private async sendMessage(to: string, message: string): Promise<void> {
    if (this.sock) {
      try {
        await this.sock.sendMessage(to, { text: message });
        // Guardar mensaje saliente con el nuevo controlador
        await this.sharicrepasController.saveMessage(to, 'outgoing', message);
        logger.info(`Mensaje enviado a ${to}`);
      } catch (error) {
        logger.error('Error enviando mensaje:', error);
        throw error;
      }
    }
  }

  /**
   * Obtiene o crea el estado del cliente
   */
  private getCustomerState(userId: string): CustomerState {
    if (!this.customerStates.has(userId)) {
      this.customerStates.set(userId, {
        currentScreen: 'welcome',
        customerName: undefined,
        orderDetails: undefined,
        isConfirmed: false
      });
    }
    return this.customerStates.get(userId)!;
  }

  /**
   * Detecta la intención del mensaje del usuario
   */
  private detectIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (this.isGreeting(lowerText)) return 'greeting';
    if (this.isMenuRequest(lowerText)) return 'menu_request';
    if (this.isOrderRequest(lowerText)) return 'order_request';
    if (this.isLocationRequest(lowerText)) return 'location_request';
    if (this.isScheduleRequest(lowerText)) return 'schedule_request';
    if (this.isContactRequest(lowerText)) return 'contact_request';
    if (this.isHelpRequest(lowerText)) return 'help_request';
    if (/^[1-3]$/.test(text.trim())) return 'menu_selection';
    if (lowerText.includes('gracias') || lowerText.includes('thank')) return 'thanks';
    
    return 'unknown';
  }

  /**
   * Actualiza el estado de la conversación en la base de datos
   */
  private async updateConversationState(userId: string, screen: CustomerState['currentScreen'], data?: any): Promise<void> {
    try {
      await this.sharicrepasController.updateConversationSession(userId, screen, data);
      
      // También actualizar el estado local
      const state = this.getCustomerState(userId);
      state.currentScreen = screen;
      state.lastActivity = new Date();
      if (data) {
        Object.assign(state, data);
      }
    } catch (error) {
      logger.error('Error updating conversation state:', error);
    }
  }

  /**
   * Resetea el estado del cliente
   */
  private resetCustomerState(userId: string): void {
    this.customerStates.set(userId, {
      currentScreen: 'welcome',
      customerName: undefined,
      orderDetails: undefined,
      isConfirmed: false
    });
  }

  // Métodos de detección de intenciones
  private isGreeting(message: string): boolean {
    const greetings = ['hola', 'hello', 'hi', 'buenas', 'buen', 'saludos', 'ola', '/start'];
    return greetings.some(greeting => message.includes(greeting));
  }

  private isMenuRequest(message: string): boolean {
    const menuWords = ['menu', 'menú', 'carta', 'comida', 'que venden', 'qué venden', 'catalogo', 'catálogo'];
    return menuWords.some(word => message.includes(word));
  }

  private isOrderRequest(message: string): boolean {
    const orderWords = ['pedido', 'pedir', 'ordenar', 'orden', 'quiero', 'me das', 'comprar'];
    return orderWords.some(word => message.includes(word));
  }

  private isLocationRequest(message: string): boolean {
    const locationWords = ['ubicacion', 'ubicación', 'direccion', 'dirección', 'donde', 'dónde', 'maps', 'mapa'];
    return locationWords.some(word => message.includes(word));
  }

  private isScheduleRequest(message: string): boolean {
    const scheduleWords = ['horario', 'horarios', 'cuando', 'cuándo', 'abierto', 'cerrado', 'abren', 'cierran'];
    return scheduleWords.some(word => message.includes(word));
  }

  private isContactRequest(message: string): boolean {
    const contactWords = ['contacto', 'telefono', 'teléfono', 'numero', 'número', 'facebook', 'redes'];
    return contactWords.some(word => message.includes(word));
  }

  private isHelpRequest(message: string): boolean {
    const helpWords = ['ayuda', 'help', 'comandos', 'opciones', 'que puedo', 'qué puedo'];
    return helpWords.some(word => message.includes(word));
  }
}

/**
 * Estado del cliente durante la conversación
 */
interface CustomerState {
  currentScreen: 'welcome' | 'ordering' | 'taking_order' | 'completed' | 'cancelled';
  customerName?: string;
  orderDetails?: string;
  isConfirmed: boolean;
  orderNumber?: string;
  lastActivity?: Date;
}
