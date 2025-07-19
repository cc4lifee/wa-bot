import makeWASocket, { DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';

export class WhatsAppBot {
  private sock: WASocket | null = null;

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
          const lowerText = text.toLowerCase();
          if (
            lowerText.includes('hola') ||
            lowerText.includes('buenas') ||
            lowerText.includes('buenos días') ||
            lowerText.includes('buenas tardes') ||
            lowerText.includes('buenas noches')
          ) {
            await this.sock?.sendMessage(sender, {
              text: `¡Gracias por comunicarte con [Nombre del Local]! 😊\n\nNuestros horarios son:\nLunes a Sábado: 9am - 8pm\nDomingo: 10am - 6pm\n\nMenú:\n- Tacos\n- Tortas\n- Burritos\n- Bebidas\n\n¿En qué podemos ayudarte hoy?`
            });
          }
          // Ejemplo: responde a "ping"
          if (text.toLowerCase() === 'ping') {
            await this.sock?.sendMessage(sender, { text: 'pong' });
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
}