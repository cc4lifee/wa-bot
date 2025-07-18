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