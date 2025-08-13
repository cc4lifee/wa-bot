// Validaciones para requests y datos de entrada
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }
  
  // Limpiar el número
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  
  // Validar formato básico (al menos 10 dígitos)
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const validateMessage = (message: string): boolean => {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  // Validar longitud (WhatsApp tiene límite de ~4096 caracteres)
  return message.trim().length > 0 && message.length <= 4096;
};

export const validatePagination = (limit?: number, offset?: number) => {
  const parsedLimit = limit || 50;
  const parsedOffset = offset || 0;
  
  if (parsedLimit < 1 || parsedLimit > 1000) {
    throw new ValidationError('Limit must be between 1 and 1000');
  }
  
  if (parsedOffset < 0) {
    throw new ValidationError('Offset must be non-negative');
  }
  
  return { limit: parsedLimit, offset: parsedOffset };
};

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remover caracteres potencialmente peligrosos
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/\0/g, '') // Remover null bytes
    .trim();
};
