import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { setRoutes } from './routes/index';
import { DatabaseConnection } from './database/connection';
import { SharicrepasBot } from './sharicrepas/whatsappBot';
import { config } from './config';
import { logger } from './utils/logger';
import 'dotenv/config';

const app = express();
const port = config.server.port;

// Security middleware
app.use(helmet());
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database
const database = new DatabaseConnection();

async function startApp() {
    try {
        // Connect to database
        await database.connect();
        logger.info('Database connected successfully');
        
        // Set up routes
        setRoutes(app);
        logger.info('Routes configured');
        
        // Start the server
        app.listen(port, () => {
            logger.info(`🚀 Server is running on http://localhost:${port}`);
            logger.info(`📄 API documentation available at http://localhost:${port}/api-docs`);
        });
        
        // Start WhatsApp bot
        console.log('🌟 Iniciando Sharicrepas WhatsApp Bot...');
        const bot = new SharicrepasBot();
        bot.start();
        logger.info('Sharicrepas WhatsApp bot started');
        
    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
}

startApp();

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await database.close();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
});