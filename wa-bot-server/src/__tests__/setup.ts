// Setup para tests
import 'dotenv/config';

// Mock de la base de datos para tests
jest.mock('../database/connection', () => {
  return {
    DatabaseConnection: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue({ rows: [] }),
      close: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

// Mock de Winston para evitar logs durante tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
}));

// Variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
