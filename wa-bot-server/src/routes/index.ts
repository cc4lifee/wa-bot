import { Router } from 'express';
import { MessageController } from '../controllers/messageController';

const router = Router();
const messageController = new MessageController();

export function setRoutes(app: Router) {
    app.use('/api', router);
    
    router.post('/send-message', messageController.sendMessage.bind(messageController));
    router.get('/status', messageController.getStatus.bind(messageController));
}