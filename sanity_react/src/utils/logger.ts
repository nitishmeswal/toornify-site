/**
 * Production-safe logger utility
 * Console logs are stripped in production builds
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, only log error messages, not full objects
      const sanitized = args.map(arg => 
        typeof arg === 'string' ? arg : '[Error Object]'
      );
      console.error(...sanitized);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

// Sanitize sensitive data from objects before logging
export const sanitizeForLog = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'token', 'authToken', 'accessToken', 'refreshToken',
    'password', 'secret', 'apiKey', 'authorization'
  ];
  
  const sanitized = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLog(sanitized[key]);
    }
  }
  
  return sanitized;
};
