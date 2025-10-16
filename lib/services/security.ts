// lib/services/security.ts
// Security service for encryption, validation, and threat detection

import crypto from 'crypto';
import bcrypt from 'bcrypt-ts';
import { logger } from './logger';
import envConfig from '../config/env';

export interface SecurityConfig {
  jwtSecret: string;
  encryptionKey: string;
  sessionTimeout: number; // milliseconds
  maxLoginAttempts: number;
  lockoutDuration: number; // milliseconds
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
}

export interface LoginAttempt {
  ip: string;
  email: string;
  timestamp: number;
  success: boolean;
}

class SecurityService {
  private config: SecurityConfig;
  private loginAttempts = new Map<string, LoginAttempt[]>();
  private blockedIPs = new Set<string>();

  constructor() {
    this.config = {
      jwtSecret: envConfig.AUTH_SECRET,
      encryptionKey: this.generateEncryptionKey(),
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      passwordMinLength: 8,
      passwordRequireSpecial: true,
    };
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash password with salt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < this.config.passwordMinLength) {
      errors.push(`Password must be at least ${this.config.passwordMinLength} characters long`);
    }

    if (this.config.passwordRequireSpecial) {
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryptionKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate JWT token
   */
  generateJWT(payload: any): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify JWT token
   */
  verifyJWT(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [header, payload, signature] = parts;
      
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.config.jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Decode payload
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      // Check expiration
      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, payload: decodedPayload };
    } catch (error) {
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Record login attempt
   */
  recordLoginAttempt(ip: string, email: string, success: boolean): void {
    const attempt: LoginAttempt = {
      ip,
      email,
      timestamp: Date.now(),
      success,
    };

    const key = `${ip}:${email}`;
    const attempts = this.loginAttempts.get(key) || [];
    attempts.push(attempt);

    // Keep only recent attempts (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentAttempts = attempts.filter(a => a.timestamp > oneHourAgo);
    
    this.loginAttempts.set(key, recentAttempts);

    // Check for suspicious activity
    const failedAttempts = recentAttempts.filter(a => !a.success);
    if (failedAttempts.length >= this.config.maxLoginAttempts) {
      this.blockIP(ip, this.config.lockoutDuration);
      logger.warn('IP blocked due to excessive login attempts', {
        ip,
        email,
        failedAttempts: failedAttempts.length,
      });
    }

    if (success) {
      // Clear failed attempts on successful login
      this.loginAttempts.delete(key);
    }
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Block IP address
   */
  blockIP(ip: string, duration: number = this.config.lockoutDuration): void {
    this.blockedIPs.add(ip);
    
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      logger.info('IP unblocked', { ip });
    }, duration);

    logger.warn('IP blocked', { ip, duration });
  }

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate birth date
   */
  validateBirthDate(date: string): { valid: boolean; error?: string } {
    const birthDate = new Date(date);
    const now = new Date();
    const minDate = new Date(1900, 0, 1);
    const maxDate = new Date(now.getFullYear() - 1, 11, 31); // At least 1 year old

    if (isNaN(birthDate.getTime())) {
      return { valid: false, error: 'Invalid date format' };
    }

    if (birthDate < minDate) {
      return { valid: false, error: 'Birth date too far in the past' };
    }

    if (birthDate > maxDate) {
      return { valid: false, error: 'Birth date must be at least 1 year ago' };
    }

    return { valid: true };
  }

  /**
   * Validate birth time
   */
  validateBirthTime(time: string): { valid: boolean; error?: string } {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    
    if (!timeRegex.test(time)) {
      return { valid: false, error: 'Invalid time format. Use HH:MM or HH:MM:SS' };
    }

    return { valid: true };
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    blockedIPs: number;
    recentAttempts: number;
    config: SecurityConfig;
  } {
    const recentAttempts = Array.from(this.loginAttempts.values())
      .flat()
      .filter(a => a.timestamp > Date.now() - 60 * 60 * 1000).length;

    return {
      blockedIPs: this.blockedIPs.size,
      recentAttempts,
      config: this.config,
    };
  }
}

export const securityService = new SecurityService();
export default securityService;
