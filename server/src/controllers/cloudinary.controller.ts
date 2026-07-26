import { Request, Response } from 'express';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

/**
 * Option 2: Server-Side Signed Upload Signature Endpoint
 * Computes SHA-1 signature of parameters (folder=qrasoi_restaurants&timestamp=123) + CLOUDINARY_API_SECRET
 */
export const getCloudinaryUploadSignature = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const cloudName = ENV.CLOUDINARY_CLOUD_NAME || 'demo';
    const apiKey = ENV.CLOUDINARY_API_KEY || '1234567890';
    const apiSecret = ENV.CLOUDINARY_API_SECRET || 'fallback_secret';
    const folder = 'qrasoi_restaurants';

    const timestamp = Math.floor(Date.now() / 1000);

    // Alphabetized parameter string + secret
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    // Compute SHA-1 hash signature
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    res.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate Cloudinary signature' });
  }
};
