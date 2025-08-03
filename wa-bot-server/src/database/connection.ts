import { Pool } from 'pg';

export class DatabaseConnection {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'whatsapp_bot',
            user: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20, // maximum number of clients in the pool
            idleTimeoutMillis: 30000, // close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
        });
    }

    async connect(): Promise<void> {
        try {
            const client = await this.pool.connect();
            console.log('Connection to PostgreSQL database has been established successfully.');
            client.release();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
    }

    async query(text: string, params?: any[]): Promise<any> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
        console.log('Database connection pool has been closed.');
    }
}
