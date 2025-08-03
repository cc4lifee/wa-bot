import { Router, Application } from 'express';
import { MessageController } from '../controllers/messageController';

export function setRoutes(app: Application) {
    const router = Router();
    const messageController = new MessageController();
    
    // Message routes
    router.get('/status', (req, res) => messageController.getStatus(req, res));
    router.post('/send-message', (req, res) => messageController.sendMessage(req, res));
    router.get('/messages', (req, res) => messageController.getMessages(req, res));
    router.get('/messages/:phoneNumber', (req, res) => messageController.getMessagesByUser(req, res));
    
    // User routes
    router.get('/users', (req, res) => messageController.getUsers(req, res));
    router.post('/users', (req, res) => messageController.createUser(req, res));
    
    app.use('/api', router);
}