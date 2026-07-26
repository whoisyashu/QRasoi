import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: number;
  isVerified: boolean;
  resetToken?: string;
}

// In-memory store for active OTP reset requests
export const otpStore: Map<string, OtpRecord> = new Map();

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

const JWT_SECRET = getRequiredEnv('JWT_SECRET');

/**
 * Configure Brevo SMTP Transporter
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = getRequiredEnv('SMTP_USER');
  const pass = getRequiredEnv('SMTP_PASS');

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // TLS on port 587
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Generate a random 6-digit numeric OTP
 */
export const generateNumericOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Request & Send Email OTP for Password Reset via Brevo SMTP
 */
export const createAndSendEmailOtp = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  const normalizedEmail = email.toLowerCase().trim();

  // Generate 6-digit OTP valid for 10 minutes (600,000 ms)
  const otp = generateNumericOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(normalizedEmail, {
    email: normalizedEmail,
    otp,
    expiresAt,
    isVerified: false,
  });

  const transporter = createTransporter();
  let emailSent = false;
  let errorDetails = '';

  try {
    const senderEmail = process.env.SENDER_EMAIL?.trim() || getRequiredEnv('SMTP_USER');
    const info = await transporter.sendMail({
      from: `"QRasoi Support" <${senderEmail}>`,
      to: normalizedEmail,
      subject: `[QRasoi] Your Password Reset OTP is ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #fffdf8;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #ea580c; margin: 0; font-size: 24px; font-weight: 800;">QRasoi Digital Menus</h2>
            <p style="color: #6b7280; font-size: 13px; margin-top: 4px; font-weight: 600;">Restaurant Account Security</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #fed7aa; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <p style="font-size: 14px; color: #334155; margin-bottom: 14px; font-weight: 600;">Use the 6-digit verification code below to reset your password:</p>
            <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ea580c; padding: 14px 24px; background-color: #fff7ed; border-radius: 10px; display: inline-block; border: 1px border-orange-200;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 14px; font-weight: 500;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
          </div>

          <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 16px;">If you did not request a password reset, please ignore this message.</p>
          <div style="border-t: 1px solid #f3f4f6; margin-top: 20px; pt: 12px; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af;">© 2026 QRasoi Digital Technologies. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    emailSent = true;
    console.log(`[Brevo SMTP Success]: Email delivered to ${normalizedEmail} (Message ID: ${info.messageId})`);
  } catch (err: any) {
    errorDetails = err?.message || 'Brevo SMTP transport error';
    console.error(`[Brevo SMTP Error]: ${errorDetails}`);
  }

  if (!emailSent) {
    throw new Error(`Failed to send password reset email via Brevo SMTP: ${errorDetails}`);
  }

  return {
    success: true,
    message: `A 6-digit password reset OTP has been sent via email to ${normalizedEmail}. Please check your inbox.`,
  };
};

/**
 * Verify received 6-digit OTP
 */
export const verifyEmailOtp = (
  email: string,
  userOtp: string
): { valid: boolean; error?: string; resetToken?: string } => {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { valid: false, error: 'No OTP request found for this email. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: 'OTP code has expired. Please request a new OTP.' };
  }

  if (record.otp !== userOtp.trim()) {
    return { valid: false, error: 'Invalid 6-digit OTP code. Please check your email and try again.' };
  }

  // Issue short-lived Reset JWT Token valid for 15 minutes
  const resetToken = jwt.sign(
    { email: normalizedEmail, purpose: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  record.isVerified = true;
  record.resetToken = resetToken;
  otpStore.set(normalizedEmail, record);

  return { valid: true, resetToken };
};

/**
 * Validate Reset Session Token
 */
export const validateResetToken = (email: string, resetToken: string): boolean => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const decoded = jwt.verify(resetToken, JWT_SECRET) as any;

    if (decoded.email !== normalizedEmail || decoded.purpose !== 'password_reset') {
      return false;
    }

    const record = otpStore.get(normalizedEmail);
    return Boolean(record && record.isVerified && record.resetToken === resetToken);
  } catch (err) {
    return false;
  }
};

/**
 * Invalidate OTP after password reset completion
 */
export const consumeOtpSession = (email: string): void => {
  otpStore.delete(email.toLowerCase().trim());
};
