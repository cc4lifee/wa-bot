import { validatePhoneNumber, validateMessage, ValidationError } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('+1-234-567-8901')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('abc')).toBe(false);
      expect(validatePhoneNumber('123456789012345678')).toBe(false); // Too long
    });

    it('should handle null and undefined', () => {
      expect(validatePhoneNumber(null as any)).toBe(false);
      expect(validatePhoneNumber(undefined as any)).toBe(false);
    });
  });

  describe('validateMessage', () => {
    it('should validate correct messages', () => {
      expect(validateMessage('Hello world')).toBe(true);
      expect(validateMessage('A'.repeat(100))).toBe(true);
    });

    it('should reject invalid messages', () => {
      expect(validateMessage('')).toBe(false);
      expect(validateMessage('   ')).toBe(false); // Only spaces
      expect(validateMessage('A'.repeat(5000))).toBe(false); // Too long
    });

    it('should handle null and undefined', () => {
      expect(validateMessage(null as any)).toBe(false);
      expect(validateMessage(undefined as any)).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create proper validation error', () => {
      const error = new ValidationError('Test error message');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test error message');
    });
  });
});
