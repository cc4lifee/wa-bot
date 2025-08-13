import { DatabaseConnection } from '../database/connection';
import 'dotenv/config';

export class SharicrepasDatabaseSetup {
    private db: DatabaseConnection;

    constructor() {
        this.db = new DatabaseConnection();
    }

    async initializeSharicrepasTables(): Promise<void> {
        try {
            console.log('🍯 Inicializando tablas específicas para Sharicrepas...');

            // Tabla para clientes de Sharicrepas con información específica
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS sharicrepas_customers (
                    id SERIAL PRIMARY KEY,
                    phone_number VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    preferred_name VARCHAR(100), -- Como les gusta que los llamen
                    total_orders INTEGER DEFAULT 0,
                    total_spent DECIMAL(10,2) DEFAULT 0.00,
                    favorite_products TEXT[], -- Array de productos favoritos
                    last_order_date TIMESTAMP,
                    customer_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_vip BOOLEAN DEFAULT false, -- Clientes VIP (muchos pedidos)
                    notes TEXT, -- Notas especiales del cliente
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Tabla para sesiones de conversación (estados del bot)
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS conversation_sessions (
                    id SERIAL PRIMARY KEY,
                    phone_number VARCHAR(20) NOT NULL,
                    current_screen VARCHAR(50) DEFAULT 'welcome', -- welcome, ordering, taking_order, etc.
                    session_data JSONB, -- Estado flexible en JSON
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    FOREIGN KEY (phone_number) REFERENCES sharicrepas_customers(phone_number) ON DELETE CASCADE
                );
            `);

            // Tabla para pedidos de Sharicrepas
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS sharicrepas_orders (
                    id SERIAL PRIMARY KEY,
                    order_number VARCHAR(50) UNIQUE NOT NULL, -- SH240812001, etc.
                    phone_number VARCHAR(20) NOT NULL,
                    customer_name VARCHAR(255),
                    order_details TEXT NOT NULL, -- Descripción del pedido
                    order_type VARCHAR(20) DEFAULT 'whatsapp', -- whatsapp, phone, walk-in
                    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled
                    estimated_time INTEGER, -- Tiempo estimado en minutos
                    total_amount DECIMAL(10,2),
                    payment_method VARCHAR(20), -- cash, card, transfer
                    special_instructions TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (phone_number) REFERENCES sharicrepas_customers(phone_number) ON DELETE CASCADE
                );
            `);

            // Tabla para analytics y métricas específicas
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS sharicrepas_analytics (
                    id SERIAL PRIMARY KEY,
                    date DATE NOT NULL,
                    total_conversations INTEGER DEFAULT 0,
                    total_orders INTEGER DEFAULT 0,
                    conversion_rate DECIMAL(5,2), -- % de conversaciones que se vuelven pedidos
                    popular_products JSONB, -- Productos más solicitados del día
                    busiest_hours JSONB, -- Horas con más actividad
                    new_customers INTEGER DEFAULT 0,
                    returning_customers INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(date)
                );
            `);

            // Tabla para feedback y satisfacción del cliente
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS customer_feedback (
                    id SERIAL PRIMARY KEY,
                    phone_number VARCHAR(20) NOT NULL,
                    order_id INTEGER,
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                    feedback_text TEXT,
                    feedback_type VARCHAR(20) DEFAULT 'general', -- order, service, product, general
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (phone_number) REFERENCES sharicrepas_customers(phone_number) ON DELETE CASCADE,
                    FOREIGN KEY (order_id) REFERENCES sharicrepas_orders(id) ON DELETE SET NULL
                );
            `);

            // Tabla para mensajes mejorada con categorización
            await this.db.query(`
                CREATE TABLE IF NOT EXISTS sharicrepas_messages (
                    id SERIAL PRIMARY KEY,
                    message_id VARCHAR(255) UNIQUE NOT NULL,
                    phone_number VARCHAR(20) NOT NULL,
                    direction VARCHAR(10) NOT NULL, -- incoming, outgoing
                    message_text TEXT,
                    message_type VARCHAR(50) DEFAULT 'text',
                    intent VARCHAR(50), -- greeting, menu_request, order_request, location, etc.
                    response_time_ms INTEGER, -- Tiempo de respuesta del bot
                    timestamp BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (phone_number) REFERENCES sharicrepas_customers(phone_number) ON DELETE CASCADE
                );
            `);

            // Índices para optimizar consultas
            await this.db.query(`
                CREATE INDEX IF NOT EXISTS idx_customers_phone ON sharicrepas_customers(phone_number);
                CREATE INDEX IF NOT EXISTS idx_orders_phone ON sharicrepas_orders(phone_number);
                CREATE INDEX IF NOT EXISTS idx_orders_status ON sharicrepas_orders(status);
                CREATE INDEX IF NOT EXISTS idx_orders_date ON sharicrepas_orders(created_at);
                CREATE INDEX IF NOT EXISTS idx_messages_phone ON sharicrepas_messages(phone_number);
                CREATE INDEX IF NOT EXISTS idx_messages_intent ON sharicrepas_messages(intent);
                CREATE INDEX IF NOT EXISTS idx_analytics_date ON sharicrepas_analytics(date);
            `);

            console.log('✅ Tablas de Sharicrepas inicializadas exitosamente!');
        } catch (error) {
            console.error('❌ Error inicializando tablas de Sharicrepas:', error);
            throw error;
        }
    }

    async seedInitialData(): Promise<void> {
        try {
            console.log('🌱 Agregando datos iniciales...');

            // Crear registro de analytics para hoy
            const today = new Date().toISOString().split('T')[0];
            await this.db.query(`
                INSERT INTO sharicrepas_analytics (date, total_conversations, total_orders, conversion_rate)
                VALUES ($1, 0, 0, 0.00)
                ON CONFLICT (date) DO NOTHING;
            `, [today]);

            console.log('✅ Datos iniciales agregados!');
        } catch (error) {
            console.error('❌ Error agregando datos iniciales:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        await this.db.close();
    }
}

// Script para ejecutar la inicialización
async function runSharicrepasSetup() {
    const setup = new SharicrepasDatabaseSetup();
    try {
        await setup.initializeSharicrepasTables();
        await setup.seedInitialData();
        console.log('🎉 Setup de Sharicrepas completado exitosamente!');
    } catch (error) {
        console.error('💥 Setup falló:', error);
        process.exit(1);
    } finally {
        await setup.close();
    }
}

// Ejecutar si este archivo se llama directamente
if (require.main === module) {
    runSharicrepasSetup();
}
