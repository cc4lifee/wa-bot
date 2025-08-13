import 'dotenv/config';

export interface AppConfig {
  server: {
    port: number;
    environment: string;
    apiKey?: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    maxConnections: number;
    idleTimeout: number;
    connectionTimeout: number;
  };
  whatsapp: {
    sessionPath: string;
    messageDelay: number;
    maxRetries: number;
  };
  logging: {
    level: string;
    enableFileLogging: boolean;
  };
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USERNAME',
  'DB_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    environment: process.env.NODE_ENV || 'development',
    apiKey: process.env.API_KEY,
  },
  database: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    name: process.env.DB_NAME!,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  },
  whatsapp: {
    sessionPath: process.env.WA_SESSION_PATH || 'auth',
    messageDelay: parseInt(process.env.WA_MESSAGE_DELAY || '1000'),
    maxRetries: parseInt(process.env.WA_MAX_RETRIES || '3'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING !== 'false',
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
  },
};

// Función para validar configuración
export const validateConfig = (): void => {
  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error('Invalid server port');
  }
  
  if (config.database.maxConnections < 1) {
    throw new Error('Database max connections must be at least 1');
  }
  
  if (config.whatsapp.messageDelay < 0) {
    throw new Error('WhatsApp message delay cannot be negative');
  }
};

// Validar al importar
validateConfig();
