import crypto from 'crypto';

export function generatePassword(size: number = 6) {
  return crypto.randomBytes(size).toString('base64');
}
