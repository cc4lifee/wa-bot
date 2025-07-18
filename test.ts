import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';

async function main() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    browser: ["WA-Bot", "Chrome", "Android"], // ← esta línea es clave
  });

  // Mostrar QR
  sock.ev.on('connection.update', (update) => {
    const { qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
    }
  });

  // Guardar credenciales si se actualizan
  sock.ev.on('creds.update', saveCreds);

  // Escuchar mensajes de prueba
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    const text = msg.message?.conversation || '';
    const from = msg.key.remoteJid;

    console.log(`📨 Mensaje de ${from}: ${text}`);

    if (text.toLowerCase() === 'hola') {
      await sock.sendMessage(from!, { text: '¡Hola! Soy un bot 🤖' });
    }
  });
}

main();
