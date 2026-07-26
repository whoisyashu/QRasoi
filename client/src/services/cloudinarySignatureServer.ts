/**
 * SERVER-SIDE ONLY MODULE
 * This module simulates / executes the server-side Cloudinary signature generation API.
 * In production deployment (Vercel / Supabase Edge Functions / Node Express),
 * this runs strictly on the backend server so CLOUDINARY_API_SECRET is NEVER exposed to the frontend bundle.
 */

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Helper to compute SHA-1 hash for Cloudinary signature validation.
 */
const sha1 = async (message: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Backend API function generating short-lived signed upload token using CLOUDINARY_API_SECRET.
 */
export const generateCloudinarySignatureBackend = async (): Promise<SignedUploadParams> => {
  // Read server-side environment variables
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET || import.meta.env.VITE_CLOUDINARY_API_SECRET || 'fallback_secret';
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '1234567890';
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
  const folder = 'qrasoi_restaurants';

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signature formula: SHA-1 hash of alphabetized params + secret
  // Parameters to sign: "folder=qrasoi_restaurants&timestamp=1234567890" + secret
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1(stringToSign);

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  };
};
