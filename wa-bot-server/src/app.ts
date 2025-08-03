import express from 'express';
import { setRoutes } from './routes/index';
import { DatabaseConnection } from './database/connection';
import { WhatsAppBot } from './bot/whatsappBot';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const database = new DatabaseConnection();

async function startApp() {
    try {
        // Connect to database
        await database.connect();
        
        // Set up routes
        setRoutes(app);
        
        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
        
        // Start WhatsApp bot
        const bot = new WhatsAppBot();
        bot.start();
        
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

startApp();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await database.close();
    process.exit(0);
});