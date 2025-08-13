import { BotController } from '../controllers/botController';
import { DatabaseConnection } from '../database/connection';

// Mock de la base de datos
jest.mock('../database/connection');

describe('BotController', () => {
  let botController: BotController;
  let mockDb: jest.Mocked<DatabaseConnection>;

  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();
    
    botController = new BotController();
    mockDb = (botController as any).db;
  });

  describe('saveIncomingMessage', () => {
    it('should save incoming message successfully', async () => {
      // Arrange
      const from = '+1234567890@s.whatsapp.net';
      const text = 'Hello, bot!';
      
      mockDb.query.mockResolvedValue({
        rows: [{ id: 1, message_id: 'test_id' }]
      });

      // Act
      const result = await botController.saveIncomingMessage(from, text);

      // Assert
      expect(result).toBe(true);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO chat_messages'),
        expect.arrayContaining([
          expect.stringContaining('incoming_'),
          from,
          'bot',
          text,
          'text',
          expect.any(Number)
        ])
      );
    });

    it('should return false when database error occurs', async () => {
      // Arrange
      const from = '+1234567890@s.whatsapp.net';
      const text = 'Hello, bot!';
      
      mockDb.query.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await botController.saveIncomingMessage(from, text);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('registerWhatsAppUser', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const phoneNumber = '+1234567890@s.whatsapp.net';
      const name = 'Test User';
      
      mockDb.query.mockResolvedValue({
        rows: [{
          id: '1',
          name: 'Test User',
          phone_number: '1234567890',
          is_active: true
        }]
      });

      // Act
      const result = await botController.registerWhatsAppUser(phoneNumber, name);

      // Assert
      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        phoneNumber: '1234567890',
        isActive: true
      });
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['1234567890', 'Test User', 'user']
      );
    });

    it('should clean phone number correctly', async () => {
      // Arrange
      const phoneNumber = '+1234567890@s.whatsapp.net';
      
      mockDb.query.mockResolvedValue({
        rows: [{ id: '1', name: null, phone_number: '1234567890', is_active: true }]
      });

      // Act
      await botController.registerWhatsAppUser(phoneNumber);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        ['1234567890', null, 'user'] // Verificar que el número se limpió correctamente
      );
    });
  });

  describe('getTodayMessageCount', () => {
    it('should return message count for today', async () => {
      // Arrange
      mockDb.query.mockResolvedValue({
        rows: [{ count: '42' }]
      });

      // Act
      const result = await botController.getTodayMessageCount();

      // Assert
      expect(result).toBe(42);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        [expect.any(Number)] // Timestamp del inicio del día
      );
    });

    it('should return 0 when database error occurs', async () => {
      // Arrange
      mockDb.query.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await botController.getTodayMessageCount();

      // Assert
      expect(result).toBe(0);
    });
  });
});
