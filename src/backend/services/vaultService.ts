import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import { encryptData, decryptData, deriveKeyFromPin } from './encryptionService.js';
import crypto from 'crypto';

interface FileUpload {
  originalname: string;
  buffer: Buffer;
}

export async function createContainer(files: FileUpload[], containerPath: string, pin: string, salt: string) {
  const zip = new AdmZip();
  
  for (const file of files) {
    zip.addFile(file.originalname, file.buffer);
  }
  
  const zipBuffer = zip.toBuffer();
  
  // Calculate SHA-256 hash of the decrypted content
  const contentHash = crypto.createHash('sha256').update(zipBuffer).digest();
  
  // Prepend the 32-byte hash to the zip buffer
  const payloadToEncrypt = Buffer.concat([contentHash, zipBuffer]);
  
  const key = deriveKeyFromPin(pin, Buffer.from(salt, 'hex'));
  const encryptedPayload = encryptData(payloadToEncrypt, key);
  
  await fs.writeFile(containerPath, encryptedPayload);
}

export async function unlockContainer(containerPath: string, pin: string, salt: string): Promise<Buffer> {
  const encryptedPayload = await fs.readFile(containerPath);
  
  const key = deriveKeyFromPin(pin, Buffer.from(salt, 'hex'));
  
  let decryptedPayload;
  try {
    decryptedPayload = decryptData(encryptedPayload, key);
  } catch (error) {
    throw new Error('Decryption failed. Invalid PIN or corrupted container.');
  }
  
  // Ensure the payload is at least 32 bytes (size of SHA-256 hash)
  if (decryptedPayload.length < 32) {
    throw new Error('Integrity check failed: Container payload is too small.');
  }

  // Extract the 32-byte stored hash and the actual content (zipBuffer)
  const storedHash = decryptedPayload.slice(0, 32);
  const zipBuffer = decryptedPayload.slice(32);
  
  // Calculate the SHA-256 hash of the actual content
  const calculatedHash = crypto.createHash('sha256').update(zipBuffer).digest();
  
  // Compare the calculated hash against the stored hash
  if (!crypto.timingSafeEqual(storedHash, calculatedHash)) {
    throw new Error('Integrity check failed: Container has been tampered with or corrupted.');
  }
  
  return zipBuffer;
}

export async function deleteContainer(containerPath: string) {
  try {
    await fs.unlink(containerPath);
  } catch (e) {
    console.error('Failed to delete container', e);
  }
}
