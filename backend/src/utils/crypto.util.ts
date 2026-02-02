import crypto from 'crypto';
import 'dotenv/config';
import type { EncPassData } from '../types/types';

const algorithm = 'aes-256-gcm';

export function encrypt(text: string): EncPassData {
  if (!process.env.AES_KEY) {
    throw new Error('AES_KEY is not defined in environment variables');
  }

  if (!process.env.AES_IV) {
    throw new Error('AES_IV is not defined in environment variables');
  }

  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(process.env.AES_KEY, 'base64'),
    Buffer.from(process.env.AES_IV, 'base64'),
  );

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: process.env.AES_IV,
    authTag: authTag.toString('base64'),
  }
}

export function decrypt(data: EncPassData): string {
  if (!process.env.AES_KEY) {
    throw new Error('AES_KEY is not defined in environment variables');
  }

  if (!process.env.AES_IV) {
    throw new Error('AES_IV is not defined in environment variables');
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(process.env.AES_KEY, 'base64'),
    Buffer.from(data.iv, 'base64'),
  );

  decipher.setAuthTag(Buffer.from(data.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.ciphertext, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

const testString = 'Hello, World!';
const encryptedData = encrypt(testString);
console.log('Encrypted Data:', encryptedData);
const decryptedString = decrypt(encryptedData);
console.log('Decrypted String:', decryptedString);
