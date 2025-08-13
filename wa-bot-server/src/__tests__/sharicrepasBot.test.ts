import { SharicrepasBot } from '../sharicrepas/whatsappBot';
import { SharicrepasMessages } from '../sharicrepas/messages';
import { isBusinessOpen } from '../sharicrepas/config';

// Mock del BotController
jest.mock('../controllers/botController', () => ({
  BotController: jest.fn().mockImplementation(() => ({
    registerWhatsAppUser: jest.fn().mockResolvedValue(true),
    saveIncomingMessage: jest.fn().mockResolvedValue(true),
    saveOutgoingMessage: jest.fn().mockResolvedValue(true)
  }))
}));

// Mock del logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('SharicrepasBot', () => {
  let bot: SharicrepasBot;
  let mockSendMessage: jest.Mock;

  beforeEach(() => {
    bot = new SharicrepasBot();
    mockSendMessage = jest.fn();
    
    // Mock del método sendMessage
    (bot as any).sendMessage = mockSendMessage;
    (bot as any).sock = { sendMessage: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Detección de intenciones', () => {
    it('debería detectar saludos correctamente', () => {
      const greetings = ['hola', 'hello', 'buenas tardes', 'buenos dias', 'hi'];
      
      greetings.forEach(greeting => {
        expect((bot as any).isGreeting(greeting)).toBe(true);
      });
    });

    it('debería detectar solicitudes de menú correctamente', () => {
      const menuRequests = ['menu', 'menú', 'que venden', 'catalogo', 'catálogo', 'carta'];
      
      menuRequests.forEach(request => {
        expect((bot as any).isMenuRequest(request)).toBe(true);
      });
    });

    it('debería detectar solicitudes de pedido correctamente', () => {
      const orderRequests = ['pedido', 'pedir', 'quiero ordenar', 'me das', 'ordenar', 'comprar'];
      
      orderRequests.forEach(request => {
        expect((bot as any).isOrderRequest(request)).toBe(true);
      });
    });

    it('debería detectar solicitudes de ubicación correctamente', () => {
      const locationRequests = ['ubicacion', 'ubicación', 'direccion', 'donde estan', 'dónde', 'maps'];
      
      locationRequests.forEach(request => {
        expect((bot as any).isLocationRequest(request)).toBe(true);
      });
    });

    it('debería detectar solicitudes de horarios correctamente', () => {
      const scheduleRequests = ['horario', 'horarios', 'cuando abren', 'cuándo', 'abierto', 'cerrado'];
      
      scheduleRequests.forEach(request => {
        expect((bot as any).isScheduleRequest(request)).toBe(true);
      });
    });
  });

  describe('Procesamiento de mensajes', () => {
    it('debería responder con mensaje de bienvenida para saludos', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'hola');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('Sharicrepas');
      expect(sentMessage).toContain('6862584142');
      expect(sentMessage).toContain('4:00 pm');
    });

    it('debería responder con mensaje de menú para solicitudes de menú', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'menu');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toMatch(/catálogo|Catálogo/);
      expect(sentMessage).toContain('https://wa.me/c/5216862584142');
      expect(sentMessage).toContain('Crepas');
    });

    it('debería responder con opciones de pedido para solicitudes de pedido', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'quiero hacer un pedido');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toMatch(/pedido|ordenar/);
      expect(sentMessage).toContain('1️⃣');
      expect(sentMessage).toContain('2️⃣');
      expect(sentMessage).toContain('3️⃣');
    });

    it('debería responder con ubicación para solicitudes de ubicación', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'donde estan ubicados');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('Local amarillo');
      expect(sentMessage).toMatch(/Google Maps|maps\.app\.goo\.gl/);
      expect(sentMessage).toContain('asadero Sonora');
    });

    it('debería responder con horarios para solicitudes de horarios', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'que horarios tienen');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('4:00 pm');
      expect(sentMessage).toMatch(/Miércoles|miércoles/);
      expect(sentMessage).toContain('Jueves');
    });

    it('debería responder con información de contacto', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'contacto');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toContain('6862584142');
      expect(sentMessage).toContain('facebook.com/ShariCrepas');
    });

    it('debería responder con ayuda para comandos de ayuda', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'ayuda');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toMatch(/Comandos disponibles|puedo ayudarte/);
      expect(sentMessage).toContain('menu');
      expect(sentMessage).toContain('pedido');
    });
  });

  describe('Flujo de pedidos', () => {
    it('debería manejar el proceso de pedido con catálogo', async () => {
      const testPhone = '+1234567890';
      
      // Iniciar proceso de pedido
      await (bot as any).processMessage(testPhone, 'quiero hacer un pedido');
      
      // Verificar que el estado cambió a ordering
      const state = (bot as any).getCustomerState(testPhone);
      expect(state.currentScreen).toBe('ordering');
      
      // Seleccionar opción de catálogo
      await (bot as any).processMessage(testPhone, '1');
      
      expect(mockSendMessage).toHaveBeenCalledTimes(2);
      const lastMessage = mockSendMessage.mock.calls[1][1];
      expect(lastMessage).toMatch(/catálogo|Catálogo/);
      expect(lastMessage).toContain('https://wa.me/c/5216862584142');
    });

    it('debería manejar pedido asistido', async () => {
      const testPhone = '+1234567890';
      
      // Iniciar proceso de pedido
      await (bot as any).processMessage(testPhone, 'pedido');
      
      // Seleccionar opción asistida
      await (bot as any).processMessage(testPhone, '2');
      
      expect(mockSendMessage).toHaveBeenCalledTimes(2);
      const lastMessage = mockSendMessage.mock.calls[1][1];
      expect(lastMessage).toMatch(/¿Qué te gustaría ordenar\?|Escribe tu pedido/);
      
      // Verificar que cambió a taking_order
      const state = (bot as any).getCustomerState(testPhone);
      expect(state.currentScreen).toBe('taking_order');
    });

    it('debería manejar llamada directa', async () => {
      const testPhone = '+1234567890';
      
      // Iniciar proceso de pedido
      await (bot as any).processMessage(testPhone, 'pedido');
      
      // Seleccionar opción de llamada
      await (bot as any).processMessage(testPhone, '3');
      
      expect(mockSendMessage).toHaveBeenCalledTimes(2);
      const lastMessage = mockSendMessage.mock.calls[1][1];
      expect(lastMessage).toContain('6862584142');
      expect(lastMessage).toMatch(/Llámanos|directamente/);
    });
  });

  describe('Estado del cliente', () => {
    it('debería mantener estado del cliente durante proceso de pedido', async () => {
      const testPhone = '+1234567890';
      
      // Iniciar proceso de pedido
      await (bot as any).processMessage(testPhone, 'quiero hacer un pedido');
      
      // Verificar que el estado se mantiene
      const state = (bot as any).getCustomerState(testPhone);
      expect(state).toBeDefined();
      expect(state.currentScreen).toBe('ordering');
    });

    it('debería resetear estado del cliente en saludo', async () => {
      const testPhone = '+1234567890';
      
      // Establecer un estado
      (bot as any).getCustomerState(testPhone).currentScreen = 'ordering';
      
      // Enviar saludo
      await (bot as any).processMessage(testPhone, 'hola');
      
      // Verificar que se resetea
      const state = (bot as any).getCustomerState(testPhone);
      expect(state.currentScreen).toBe('welcome');
    });

    it('debería manejar múltiples clientes simultáneamente', async () => {
      const testPhone1 = '+1234567890';
      const testPhone2 = '+0987654321';
      
      // Procesar mensajes de diferentes clientes
      await (bot as any).processMessage(testPhone1, 'pedido');
      await (bot as any).processMessage(testPhone2, 'menu');
      
      // Verificar estados independientes
      const state1 = (bot as any).getCustomerState(testPhone1);
      const state2 = (bot as any).getCustomerState(testPhone2);
      
      expect(state1.currentScreen).toBe('ordering');
      expect(state2.currentScreen).toBe('welcome');
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar comandos desconocidos graciosamente', async () => {
      const testPhone = '+1234567890';
      
      await (bot as any).processMessage(testPhone, 'comando inexistente xyz123');
      
      expect(mockSendMessage).toHaveBeenCalled();
      const sentMessage = mockSendMessage.mock.calls[0][1];
      expect(sentMessage).toMatch(/No entendí|ayuda/);
    });

    it('debería manejar errores de envío de WhatsApp', async () => {
      const testPhone = '+1234567890';
      
      // Simular error en sock.sendMessage
      (bot as any).sock = {
        sendMessage: jest.fn().mockRejectedValue(new Error('Network error'))
      };
      
      // El processMessage debería capturar el error
      await expect((bot as any).processMessage(testPhone, 'hola')).resolves.not.toThrow();
    });
  });
});

describe('SharicrepasMessages', () => {
  describe('Mensajes estáticos', () => {
    it('debería contener información del negocio en mensaje de bienvenida', () => {
      const welcome = SharicrepasMessages.getWelcomeMessage();
      
      expect(welcome).toContain('Sharicrepas');
      expect(welcome).toContain('6862584142');
      expect(welcome).toContain('https://wa.me/c/5216862584142');
      expect(welcome).toContain('4:00 pm');
      expect(welcome).toMatch(/miércoles|Miércoles/);
    });

    it('debería incluir enlace al catálogo en mensaje de menú', () => {
      const menu = SharicrepasMessages.getMenuMessage();
      
      expect(menu).toContain('https://wa.me/c/5216862584142');
      expect(menu).toContain('Crepas');
      expect(menu).toContain('Waffles');
      expect(menu).toContain('Bebidas');
    });

    it('debería tener información de ubicación completa', () => {
      const location = SharicrepasMessages.getLocationMessage();
      
      expect(location).toContain('Local amarillo');
      expect(location).toContain('asadero Sonora');
      expect(location).toMatch(/Google Maps|maps\.app\.goo\.gl/);
      expect(location).toContain('Ab 13 septiembre');
    });

    it('debería mostrar horarios correctos', () => {
      const schedule = SharicrepasMessages.getScheduleMessage();
      
      expect(schedule).toContain('Jueves a Martes');
      expect(schedule).toContain('4:00 pm');
      expect(schedule).toContain('11:00 pm');
      expect(schedule).toMatch(/Miércoles|miércoles/);
    });
  });

  describe('Mensajes dinámicos', () => {
    it('debería formatear confirmación de pedido correctamente', () => {
      const confirmation = SharicrepasMessages.getOrderConfirmationMessage(
        'Juan Pérez',
        'Crepa de nutella y waffle de fresa'
      );
      
      expect(confirmation).toContain('Juan Pérez');
      expect(confirmation).toContain('Crepa de nutella y waffle de fresa');
      expect(confirmation).toContain('15-20 minutos');
      expect(confirmation).toContain('6862584142');
      expect(confirmation).toContain('Local amarillo');
    });

    it('debería manejar nombres con caracteres especiales', () => {
      const confirmation = SharicrepasMessages.getOrderConfirmationMessage(
        'María José Rodríguez',
        'Pedido especial'
      );
      
      expect(confirmation).toContain('María José Rodríguez');
      expect(confirmation).toContain('Pedido especial');
    });
  });
});

describe('Configuración de negocio', () => {
  describe('Horarios de atención', () => {
    it('debería ser una función válida', () => {
      // Solo verificamos que no lance error
      expect(typeof isBusinessOpen()).toBe('boolean');
    });

    // Nota: No podemos probar horarios específicos sin mockear Date
    // porque depende de la hora actual del sistema
  });
});
