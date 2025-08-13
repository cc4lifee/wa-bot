/**
 * Configuración específica para Sharicrepas
 */

export const SharicrepasConfig = {
  // Información del negocio
  business: {
    name: 'Sharicrepas',
    phone: '6862584142',
    facebook: 'https://www.facebook.com/ShariCrepas/',
    catalogUrl: 'https://wa.me/c/5216862584142',
    mapsUrl: 'https://maps.app.goo.gl/Ry67QEz6tMjaZVMGA',
    address: 'Local amarillo⭐, junto asadero Sonora y papelería esro, Ab 13 septiembre y av girasoles'
  },

  // Horarios de atención
  schedule: {
    open: {
      days: 'Jueves a Martes',
      hours: '4:00 pm - 11:00 pm',
      note: 'Cerrado los miércoles'
    },
    timezone: 'America/Mexico_City'
  },

  // Productos principales (para referencia en conversaciones)
  products: {
    categories: [
      '🥞 Crepas dulces y saladas',
      '🧇 Waffles artesanales', 
      '☕ Bebidas (cafés, frappes)',
      '🍔 Hamburguesas y hot dogs',
      '🍗 Boneless y nachos',
      '🍟 Papas y aros de cebolla',
      '🍢 Banderillas estilo coreano',
      '🍽️ Charolas especiales'
    ]
  },

  // Configuración del bot
  bot: {
    defaultResponseDelay: 1000, // milisegundos
    maxMessageLength: 4000,
    enableLogging: true
  }
};

/**
 * Utilidad para verificar si estamos en horario de atención
 */
export function isBusinessOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const hour = now.getHours();
  
  // Miércoles = 3, cerrado
  if (day === 3) {
    return false;
  }
  
  // Horario: 4:00 pm (16:00) a 11:00 pm (23:00)
  return hour >= 16 && hour < 23;
}

/**
 * Obtiene mensaje personalizado según la hora
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return '¡Buenos días! 🌅';
  } else if (hour >= 12 && hour < 18) {
    return '¡Buenas tardes! ☀️';
  } else {
    return '¡Buenas noches! 🌙';
  }
}
