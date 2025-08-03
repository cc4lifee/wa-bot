import { Request, Response } from 'express';

export class MessageController {
  public async getStatus(req: Request, res: Response) {
    try {
      res.json({ status: 'ok' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error', code: 'ERR_GET_STATUS' });
    }
  }

  public async sendMessage(req: Request, res: Response) {
    try {
      // ... lógica para enviar mensaje ...
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to send message', code: 'ERR_SEND_MESSAGE' });
    }
  }
}