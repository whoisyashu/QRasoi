import crypto from 'crypto';
import qrcode from 'qrcode';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';

const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENV.JWT_SECRET || 'qrasoi-totp-secret-key-2026').digest();
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt TOTP Secret using AES-256-CBC before saving to DB
 */
export const encryptSecret = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt TOTP Secret for verification
 */
export const decryptSecret = (encryptedText: string): string => {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText; // Fallback if plain
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return encryptedText;
  }
};

/**
 * Base32 character set for RFC 4226 / RFC 6238 TOTP
 */
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate cryptographically random Base32 TOTP secret for Google Authenticator
 */
export const generateTotpSecret = (length = 16): string => {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += BASE32_CHARS[bytes[i] % 32];
  }
  return result;
};

/**
 * Decode Base32 string to Buffer for HMAC-SHA1 calculation
 */
function base32Decode(base32: string): Buffer {
  let bits = '';
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Calculate 6-digit TOTP code for a specific counter (RFC 4226 / RFC 6238)
 */
function generateTotpCodeForCounter(secretBase32: string, counter: number): string {
  const key = base32Decode(secretBase32);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (codeInt % 1000000).toString().padStart(6, '0');
}

/**
 * Build otpauth:// URI for authenticator apps (Google Authenticator, Authy, Microsoft Authenticator)
 */
export const generateOtpAuthUri = (email: string, secret: string): string => {
  const label = encodeURIComponent(`QRasoi:${email}`);
  const issuer = encodeURIComponent('QRasoi Platform Admin');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
};

/**
 * Render QR Code Data URL from otpauth:// URI
 */
export const generateQrCodeDataUrl = async (otpAuthUri: string): Promise<string> => {
  return await qrcode.toDataURL(otpAuthUri, {
    margin: 1,
    width: 250,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
};

/**
 * Verify 6-digit TOTP code against secret using native Node crypto (RFC 6238 compliant with +/- 30s drift)
 */
export const verifyTotpToken = (token: string, secret: string): boolean => {
  if (!token || !secret) return false;
  const cleanToken = token.replace(/\s+/g, '').trim();
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  const decryptedSecret = decryptSecret(secret);
  const currentEpoch = Math.floor(Date.now() / 1000);
  const period = 30;
  const currentCounter = Math.floor(currentEpoch / period);

  // Check current period, previous period (-30s), and next period (+30s) for clock drift tolerance
  for (let drift = -1; drift <= 1; drift++) {
    const expectedCode = generateTotpCodeForCounter(decryptedSecret, currentCounter + drift);
    if (expectedCode === cleanToken) {
      return true;
    }
  }
  return false;
};

/**
 * Generate 10 cryptographically random single-use backup recovery codes
 */
export const generateBackupCodes = (count = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
};

/**
 * Hash backup code using bcrypt before DB storage
 */
export const hashBackupCode = async (code: string): Promise<string> => {
  const clean = code.replace(/[\s-]/g, '').toUpperCase();
  return await bcrypt.hash(clean, 10);
};

/**
 * Verify plaintext backup code against array of hashed backup codes in DB
 */
export const verifyAndConsumeBackupCode = async (
  inputCode: string,
  hashedCodes: string[]
): Promise<{ isValid: boolean; remainingHashedCodes: string[] }> => {
  const cleanInput = inputCode.replace(/[\s-]/g, '').toUpperCase();

  for (let i = 0; i < hashedCodes.length; i++) {
    const isMatch = await bcrypt.compare(cleanInput, hashedCodes[i]);
    if (isMatch) {
      const remaining = [...hashedCodes];
      remaining.splice(i, 1);
      return { isValid: true, remainingHashedCodes: remaining };
    }
  }

  return { isValid: false, remainingHashedCodes: hashedCodes };
};
