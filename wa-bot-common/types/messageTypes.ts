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
