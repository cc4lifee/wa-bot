/**
 * Mensajes predefinidos para Sharicrepas
 */

export class SharicrepasMessages {
  static getWelcomeMessage(): string {
    return `🌟 *¡Hola! Bienvenido a Sharicrepas!* 😊

Podrás realizar tu pedido:
📱 6862584142 o en nuestra página
https://www.facebook.com/ShariCrepas/

*🕒 Nuestro horario:*
De jueves a martes
🌟 4:00 pm a 11:00 pm 🕚
‼️🔒 Cerrado los miércoles 🔒‼️

*🗒️ Nuestro menú:*
👉 https://wa.me/c/5216862584142

*📌 Nuestra ubicación:*
💛 Local amarillo⭐, junto asadero Sonora y papelería esro
📍 Ab 13 septiembre y av girasoles
🗺️ https://maps.app.goo.gl/Ry67QEz6tMjaZVMGA

*📱 ¿En qué puedo ayudarte?*
• Escribe *"pedido"* para hacer un pedido
• Escribe *"ubicacion"* para ver nuestra ubicación
• Escribe *"horarios"* para ver nuestros horarios
• Escribe *"menu"* para ver nuestro catálogo`;
  }

  static getMenuMessage(): string {
    return `🍽️ *Nuestro Menú Completo*

👉 *Ver catálogo completo:*
https://wa.me/c/5216862584142

*🥞 Especialidades:*
• Crepas dulces y saladas
• Waffles artesanales

*☕ Bebidas:*
• Cafés fríos
• Frappes

*🍔 Comida:*
• Nachos
• Boneless
• Papas y aros de cebolla
• Hot dogs gourmet
• Hamburguesas
• Banderillas estilo coreano
• Charolas especiales

💡 *Tip:* Usa el catálogo para ver fotos y precios actualizados`;
  }

  static getOrderMessage(): string {
    return `📝 *¿Listo para ordenar?*

*🛒 Opciones para pedido:*

1️⃣ *Catálogo WhatsApp:*
   👉 https://wa.me/c/5216862584142
   ✅ Ve fotos, precios y descripción completa

2️⃣ *Dime tu pedido:*
   📱 Escribe lo que quieres y te ayudo a tomarlo

3️⃣ *Llama directamente:*
   📞 6862584142

*🚗 Modalidades:*
• 🏠 Para llevar
• 🍽️ Comer en el local

¿Qué prefieres?`;
  }

  static getLocationMessage(): string {
    return `📌 *Nuestra Ubicación*

💛 *Local amarillo⭐*
📍 Junto asadero Sonora y papelería esro
🛣️ Ab 13 septiembre y av girasoles

🗺️ *Ver en Google Maps:*
https://maps.app.goo.gl/Ry67QEz6tMjaZVMGA

*🕒 Horarios:*
De jueves a martes: 4:00 pm - 11:00 pm
‼️ Cerrado los miércoles`;
  }

  static getScheduleMessage(): string {
    return `🕒 *Nuestros Horarios*

*📅 Abierto:*
Jueves a Martes
🌟 4:00 pm a 11:00 pm 🕚

*🔒 Cerrado:*
‼️ Miércoles (día de descanso)

📱 *Contacto:*
6862584142

💡 *¡Te esperamos!* Los fines de semana tenemos más variedad`;
  }

  static getContactMessage(): string {
    return `📞 *Contacto Sharicrepas*

*📱 WhatsApp/Teléfono:*
6862584142

*🌐 Redes sociales:*
📘 https://www.facebook.com/ShariCrepas/

*🗒️ Menú completo:*
https://wa.me/c/5216862584142

*📌 Ubicación:*
💛 Local amarillo⭐
https://maps.app.goo.gl/Ry67QEz6tMjaZVMGA`;
  }

  static getHelpMessage(): string {
    return `❓ *¿Cómo puedo ayudarte?*

*🤖 Comandos disponibles:*
• *"hola"* - Mensaje de bienvenida
• *"menu"* - Ver nuestro catálogo
• *"pedido"* - Realizar un pedido
• *"ubicacion"* - Ver dónde estamos
• *"horarios"* - Ver horarios de atención
• *"contacto"* - Información de contacto
• *"ayuda"* - Esta ayuda

*💡 Tips:*
• Puedes escribir de manera natural
• También respondo a variaciones como "menú", "ubicación", etc.
• Para pedidos específicos, usa nuestro catálogo: https://wa.me/c/5216862584142`;
  }

  static getOrderConfirmationMessage(customerName: string, orderDetails: string): string {
    return `✅ *Pedido Recibido* 

👤 *Cliente:* ${customerName}

📝 *Tu pedido:*
${orderDetails}

*⏰ Tiempo estimado:* 15-20 minutos

*📞 Nos comunicaremos contigo:*
6862584142

*📌 ¿Dónde recoger?*
💛 Local amarillo⭐ - Ab 13 septiembre y av girasoles

¡Gracias por elegir Sharicrepas! 😊🌟`;
  }

  static getOutOfHoursMessage(): string {
    return `🔒 *¡Ups! Estamos cerrados*

*🕒 Horario actual:*
De jueves a martes: 4:00 pm - 11:00 pm
‼️ Miércoles: CERRADO

*📱 Puedes:*
• Ver el menú: https://wa.me/c/5216862584142
• Revisar nuestra ubicación
• Seguirnos en Facebook: https://www.facebook.com/ShariCrepas/

*¡Te esperamos en nuestro horario de atención!* 🌟`;
  }
}
