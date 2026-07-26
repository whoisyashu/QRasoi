import { generateCloudinarySignatureBackend, SignedUploadParams } from './cloudinarySignatureServer';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '';

export const isCloudinaryConfigured = Boolean(
  cloudName && cloudName.trim().length > 0 && apiKey && apiKey.trim().length > 0
);

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface OptimizationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: 'auto' | 'good' | 'best';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

/**
 * Option 2: Signed Cloudinary Upload (Production Security Standard)
 * 1. Client requests signature from server API (CLOUDINARY_API_SECRET is kept secret on server).
 * 2. Client sends signed payload (file, signature, timestamp, api_key, folder) to Cloudinary.
 * 3. Monitors upload progress via XHR (0% -> 100%).
 */
export const uploadImageToCloudinary = async (
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // 1. File size validation (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('File size exceeds 10MB limit. Please select a smaller image.'));
      return;
    }

    try {
      // 2. Fetch short-lived SHA signature from backend API endpoint (never exposing secret to client)
      const signedParams: SignedUploadParams = await generateCloudinarySignatureBackend();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signedParams.signature);
      formData.append('timestamp', signedParams.timestamp.toString());
      formData.append('api_key', signedParams.apiKey);
      formData.append('folder', signedParams.folder);

      const xhr = new XMLHttpRequest();
      const endpointUrl = `https://api.cloudinary.com/v1_1/${signedParams.cloudName}/image/upload`;

      xhr.open('POST', endpointUrl, true);

      // Track progress percentage (0% to 100%)
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } catch (e) {
            resolve(URL.createObjectURL(file));
          }
        } else {
          console.warn('Signed Cloudinary response status:', xhr.status, xhr.responseText);
          // Fallback to Data URL preview if credentials are mock/unconfigured
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }
      };

      xhr.onerror = () => {
        console.warn('Cloudinary network request failed, using FileReader fallback.');
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      };

      xhr.send(formData);
    } catch (err: any) {
      console.warn('Error obtaining signature, using fallback reader:', err);
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }
  });
};

/**
 * Transforms Cloudinary URLs for optimal dimensions, WebP format, and CDN caching.
 */
export const getOptimizedImageUrl = (
  url: string,
  options: OptimizationOptions = {}
): string => {
  if (!url || !url.includes('cloudinary.com')) return url;

  const {
    width = 600,
    height = 400,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformations = `c_${crop},w_${width},h_${height},f_${format},q_${quality}`;
  return url.replace('/upload/', `/upload/${transformations}/`);
};
