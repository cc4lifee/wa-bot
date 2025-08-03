// Re-exportar tipos comunes desde wa-bot-common
export * from '@common/index';

// Tipos específicos del servidor que no van en common
export interface ServerConfig {
    port: number;
    dbHost: string;
    dbPort: number;
    dbName: string;
    dbUser: string;
    dbPassword: string;
}