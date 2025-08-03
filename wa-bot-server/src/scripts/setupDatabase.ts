import { DatabaseConnection } from '../database/connection';
import 'dotenv/config';

export class DatabaseSetup {
    private db: DatabaseConnection;

    constructor() {
        this.db = new DatabaseConnection();
    }

    async initializeTables(): Promise<void> {
        try {
            console.log('Initializing database tables...');

            // Tabla para mensajes de chat
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id SERIAL PRIMARY KEY,
                    message_id VARCHAR(255) UNIQUE NOT NULL,
                    from_user VARCHAR(255) NOT NULL,
                    to_user VARCHAR(255) NOT NULL,
                    message_text TEXT,
                    message_type VARCHAR(50) DEFAULT 'text',
                    timestamp BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Tabla para usuarios
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    phone_number VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    role VARCHAR(20) DEFAULT 'user',
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('Database tables initialized successfully.');
        } catch (error) {
            console.error('Error initializing database tables:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        await this.db.close();
    }
}

// Script para ejecutar la inicialización
async function runSetup() {
    const setup = new DatabaseSetup();
    try {
        await setup.initializeTables();
        console.log('Setup completed successfully!');
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    } finally {
        await setup.close();
    }
}

// Ejecutar si este archivo se llama directamente
if (require.main === module) {
    runSetup();
}
