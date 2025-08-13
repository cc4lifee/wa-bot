import { Request, Response } from 'express';
import { DatabaseConnection } from '../database/connection';
import { MessageQuery, UserQuery, ApiResponse, ChatMessage, User } from '@common/index';

export class MessageController {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection();
  }

  public async getStatus(req: Request, res: Response): Promise<void> {
    try {
      res.json({ status: 'ok', timestamp: Date.now() });
    } catch (_error) {
      res.status(500).json({ error: 'Internal Server Error', code: 'ERR_GET_STATUS' });
    }
  }

  public async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const query: MessageQuery = {
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0
      };
      
      // Consulta directa a la base de datos
      const dbQuery = `
        SELECT * FROM chat_messages 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2;
      `;
      
      const result = await this.db.query(dbQuery, [query.limit, query.offset]);
      
      const messages: ChatMessage[] = result.rows.map((row: any) => ({
        id: row.id,
        from: row.from_user,
        to: row.to_user,
        text: row.message_text,
        timestamp: row.timestamp
      }));

      const response: ApiResponse = {
        success: true,
        data: { messages, count: messages.length }
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting messages:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to get messages',
        code: 'ERR_GET_MESSAGES'
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getMessagesByUser(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!phoneNumber) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Phone number is required',
          code: 'ERR_MISSING_PHONE'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Consulta directa a la base de datos
      const dbQuery = `
        SELECT * FROM chat_messages 
        WHERE from_user = $1 OR to_user = $1
        ORDER BY created_at DESC 
        LIMIT $2;
      `;
      
      const result = await this.db.query(dbQuery, [phoneNumber, limit]);
      
      const messages: ChatMessage[] = result.rows.map((row: any) => ({
        id: row.id,
        from: row.from_user,
        to: row.to_user,
        text: row.message_text,
        timestamp: row.timestamp
      }));

      const response: ApiResponse = {
        success: true,
        data: { messages, count: messages.length }
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting messages by user:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to get messages',
        code: 'ERR_GET_MESSAGES_BY_USER'
      };
      res.status(500).json(errorResponse);
    }
  }

  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, text } = req.body;
      
      if (!to || !text) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Phone number and message text are required',
          code: 'ERR_MISSING_PARAMS'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Aquí iría la lógica para enviar el mensaje via WhatsApp
      // Por ahora solo guardamos en la base de datos
      
      const timestamp = Date.now();
      const messageId = `msg_${timestamp}`;
      
      const dbQuery = `
        INSERT INTO chat_messages (message_id, from_user, to_user, message_text, message_type, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const values = [
        messageId,
        'bot', // sender sería el bot
        to,
        text,
        'text',
        timestamp
      ];

      await this.db.query(dbQuery, values);
      
      const response: ApiResponse = {
        success: true,
        data: { messageId, sent: true }
      };
      res.json(response);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to send message',
        code: 'ERR_SEND_MESSAGE'
      };
      res.status(400).json(errorResponse);
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, name, role = 'user' } = req.body;
      
      if (!phoneNumber) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Phone number is required',
          code: 'ERR_MISSING_PHONE'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const dbQuery = `
        INSERT INTO users (phone_number, name, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (phone_number) 
        DO UPDATE SET name = $2, updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      
      const result = await this.db.query(dbQuery, [phoneNumber, name, role]);
      const user = result.rows[0];
      
      const userData: User = {
        id: user.id,
        name: user.name,
        phoneNumber: user.phone_number,
        isActive: user.is_active
      };

      const response: ApiResponse = {
        success: true,
        data: userData
      };
      res.json(response);
    } catch (error) {
      console.error('Error creating user:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to create user',
        code: 'ERR_CREATE_USER'
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const query: UserQuery = {
        limit: parseInt(req.query.limit as string) || 100,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
      };
      
      // Consulta directa a la base de datos
      const dbQuery = `
        SELECT * FROM users 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT $1;
      `;
      
      const result = await this.db.query(dbQuery, [query.limit]);
      
      const users: User[] = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        phoneNumber: row.phone_number,
        isActive: row.is_active
      }));

      const response: ApiResponse = {
        success: true,
        data: { users, count: users.length }
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting users:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to get users',
        code: 'ERR_GET_USERS'
      };
      res.status(500).json(errorResponse);
    }
  }
}