import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';

// Middleware para rate limiting simple
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = rateLimitMap.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    clientData.count++;
    next();
  };
};

// Middleware para manejo de errores
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error occurred:', error);
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Error genérico del servidor
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

// Middleware para CORS
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Middleware para autenticación API (opcional)
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;
  const validApiKey = process.env.API_KEY;
  
  // Si no hay API key configurada, saltar validación
  if (!validApiKey) {
    return next();
  }
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
      code: 'UNAUTHORIZED'
    });
  }
  
  next();
};
