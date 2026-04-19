import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

/**
 * Encrypts data using AES-256-GCM
 * @param buffer - Data to encrypt
 * @param key - 32-byte AES key
 */
export function encryptData(buffer: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  // Format: IV(16) + AuthTag(16) + EncryptedData
  return Buffer.concat([iv, tag, encrypted]);
}

/**
 * Decrypts data using AES-256-GCM
 * @param buffer - Encrypted data buffer
 * @param key - 32-byte AES key
 */
export function decryptData(buffer: Buffer, key: Buffer): Buffer {
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Generate a cryptographically secure random 32-byte key
 */
export function generateRandomKey(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * Derive a 32-byte key from a secret (like a PIN)
 */
export function deriveKeyFromPin(pin: string, salt: Buffer): Buffer {
  // Using high iterations for PBKDF2 to slow down brute force
  return crypto.pbkdf2Sync(pin, salt, 200000, 32, 'sha256');
}
