export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';

export interface OutgoingMessage {
  to: string;
  type: MessageType;
  content: string;
  timestamp: number;
}

export interface IncomingMessage {
  from: string;
  type: MessageType;
  content: string;
  timestamp: number;
}

// Tipos adicionales del servidor
export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
}

export interface MessageResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface MessageQuery {
    limit?: number;
    offset?: number;
    phoneNumber?: string;
}
