import express from 'express';
import { setRoutes } from './routes/index';
import { DatabaseORM } from './database/orm';
import { WhatsAppBot } from './bot/whatsappBot';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const database = new DatabaseORM();
database.connect();

// Set up routes
setRoutes(app);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Iniciar el bot de WhatsApp
const bot = new WhatsAppBot();
bot.start();