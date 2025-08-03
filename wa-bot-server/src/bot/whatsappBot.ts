import makeWASocket, { DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { BotController } from '../controllers/botController';

export class WhatsAppBot {
  private sock: WASocket | null = null;
  private botController: BotController;

  constructor() {
    this.botController = new BotController();
  }

  public async start() {
    try {
      // Autenticación persistente en la carpeta 'auth'
      const { state, saveCreds } = await useMultiFileAuthState('auth');

      this.sock = makeWASocket({
        auth: state,
       // printQRInTerminal: true, // Eliminado porque está deprecado
      });

      
      // Mostrar QR manualmente cuando esté disponible
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
          qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('connection closed due to', lastDisconnect?.error, ', reconnecting', shouldReconnect);
          if (shouldReconnect) {
            this.start();
          }
        } else if (connection === 'open') {
          console.log('WhatsApp bot connected');
        }
      });

      // Guardar credenciales cuando cambien
      this.sock.ev.on('creds.update', saveCreds);

      // Evento: Mensaje recibido
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' || !messages || !messages[0]?.message) return;
        
        const msg = messages[0];
        const sender = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        if (text && sender) {
          console.log(`📱 Mensaje recibido de ${sender}: ${text}`);
          
          // 1. Registrar usuario si no existe
          await this.botController.registerWhatsAppUser(sender);
          
          // 2. Guardar mensaje entrante
          await this.botController.saveIncomingMessage(sender, text);
          
          // 3. Procesar el mensaje y generar respuesta
          const response = await this.processIncomingMessage(text, sender);
          
          // 4. Enviar respuesta si hay una
          if (response && this.sock) {
            await this.sock.sendMessage(sender, { text: response });
            
            // 5. Guardar mensaje saliente
            await this.botController.saveOutgoingMessage(sender, response);
          }
        }
      });

      // Evento: Desconexión
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('connection closed due to', lastDisconnect?.error, ', reconnecting', shouldReconnect);
          if (shouldReconnect) {
            this.start();
          }
        } else if (connection === 'open') {
          console.log('WhatsApp bot connected');
        }
      });
    } catch (error) {
      console.error('Error starting WhatsApp bot:', error);
    }
  }

  /**
   * Procesa un mensaje entrante y devuelve una respuesta apropiada
   */
  private async processIncomingMessage(text: string, sender: string): Promise<string | null> {
    const lowerText = text.toLowerCase().trim();
    
    // Saludos
    if (
      lowerText.includes('hola') ||
      lowerText.includes('buenas') ||
      lowerText.includes('buenos días') ||
      lowerText.includes('buenas tardes') ||
      lowerText.includes('buenas noches') ||
      lowerText.includes('hi') ||
      lowerText.includes('hello')
    ) {
      return `¡Hola! 👋 Gracias por contactarnos.\n\n` +
             `Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?\n\n` +
             `Puedes escribir:\n` +
             `• "menú" - Ver nuestro menú\n` +
             `• "horarios" - Ver horarios de atención\n` +
             `• "ayuda" - Ver más opciones`;
    }
    
    // Menú
    if (lowerText.includes('menú') || lowerText.includes('menu') || lowerText.includes('carta')) {
      return `🍽️ **NUESTRO MENÚ**\n\n` +
             `🌮 **Tacos** - $15 c/u\n` +
             `🥙 **Tortas** - $25 c/u\n` +
             `🌯 **Burritos** - $30 c/u\n` +
             `🥤 **Bebidas** - $10 c/u\n\n` +
             `¿Te interesa algún platillo en particular?`;
    }
    
    // Horarios
    if (lowerText.includes('horario') || lowerText.includes('hora') || lowerText.includes('abierto')) {
      return `🕐 **HORARIOS DE ATENCIÓN**\n\n` +
             `📅 Lunes a Sábado: 9:00 AM - 8:00 PM\n` +
             `📅 Domingo: 10:00 AM - 6:00 PM\n\n` +
             `¡Te esperamos!`;
    }
    
    // Ayuda
    if (lowerText.includes('ayuda') || lowerText.includes('help') || lowerText.includes('comandos')) {
      return `ℹ️ **COMANDOS DISPONIBLES**\n\n` +
             `• "menú" - Ver platillos disponibles\n` +
             `• "horarios" - Horarios de atención\n` +
             `• "ubicación" - Nuestra dirección\n` +
             `• "contacto" - Información de contacto\n` +
             `• "precio" - Consultar precios\n\n` +
             `También puedes escribir libremente tu consulta.`;
    }
    
    // Ubicación
    if (lowerText.includes('ubicación') || lowerText.includes('dirección') || lowerText.includes('donde')) {
      return `📍 **NUESTRA UBICACIÓN**\n\n` +
             `Calle Principal #123\n` +
             `Colonia Centro\n` +
             `Ciudad, Estado\n\n` +
             `🚗 Estacionamiento disponible\n` +
             `🚌 Cerca del transporte público`;
    }
    
    // Precios
    if (lowerText.includes('precio') || lowerText.includes('costo') || lowerText.includes('cuanto')) {
      return `💰 **PRECIOS**\n\n` +
             `🌮 Tacos: $15 pesos c/u\n` +
             `🥙 Tortas: $25 pesos c/u\n` +
             `🌯 Burritos: $30 pesos c/u\n` +
             `🥤 Bebidas: $10 pesos c/u\n\n` +
             `*Precios sujetos a cambio sin previo aviso`;
    }
    
    // Contacto
    if (lowerText.includes('contacto') || lowerText.includes('teléfono') || lowerText.includes('llamar')) {
      return `📞 **CONTACTO**\n\n` +
             `📱 WhatsApp: Este número\n` +
             `☎️ Teléfono: (555) 123-4567\n` +
             `📧 Email: contacto@restaurant.com\n` +
             `🌐 Web: www.restaurant.com`;
    }
    
    // Ping para testing
    if (lowerText === 'ping') {
      return 'pong 🏓';
    }
    
    // Status del bot
    if (lowerText.includes('status') || lowerText.includes('estado')) {
      return `🤖 **ESTADO DEL BOT**\n\n` +
             `✅ Conectado y funcionando\n` +
             `📊 Mensajes procesados hoy: ${await this.getMessageCount()}\n` +
             `⏰ Última actualización: ${new Date().toLocaleString()}`;
    }
    
    // Respuesta por defecto para mensajes no reconocidos
    return `🤔 No entendí tu mensaje, pero estoy aquí para ayudarte.\n\n` +
           `Escribe "ayuda" para ver los comandos disponibles o describe qué necesitas.`;
  }

  /**
   * Obtiene el conteo de mensajes del día (ejemplo)
   */
  private async getMessageCount(): Promise<number> {
    // Por ahora retornamos un número aleatorio
    // Podrías implementar una consulta real a la base de datos
    return Math.floor(Math.random() * 100) + 1;
  }
}