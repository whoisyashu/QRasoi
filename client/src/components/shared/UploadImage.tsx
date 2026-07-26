import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '../../services/cloudinary';

export interface UploadImageProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  label?: string;
}

export const UploadImage: React.FC<UploadImageProps> = ({
  currentImageUrl,
  onImageUploaded,
  label = 'Dish / Restaurant Image',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgressPercent(0);
    setErrorMsg(null);

    try {
      const uploadedUrl = await uploadImageToCloudinary(file, (percent) => {
        setProgressPercent(percent);
      });
      setPreviewUrl(uploadedUrl);
      onImageUploaded(uploadedUrl);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setErrorMsg(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#334155]">{label}</label>
        {isCloudinaryConfigured ? (
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
            Cloudinary API Connected
          </span>
        ) : (
          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">
            Cloudinary Upload Enabled
          </span>
        )}
      </div>

      <div className="p-4 bg-white border border-[#E5E7EB] rounded-2xl space-y-3">
        <div className="flex items-center gap-4">
          {/* Image Preview */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white p-1">
                <Loader2 className="w-5 h-5 animate-spin text-orange-400 mb-1" />
                <span className="text-[10px] font-bold">{progressPercent}%</span>
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <p className="text-xs font-semibold text-[#334155]">Upload via Cloudinary Media CDN</p>
            <p className="text-[11px] text-[#6B7280]">Supports PNG, JPG, WebP up to 10MB</p>

            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F97316] text-xs font-bold rounded-xl transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? `Uploading (${progressPercent}%)...` : previewUrl ? 'Replace Image' : 'Choose Image File'}
              </span>
            </label>
          </div>
        </div>

        {/* Live Upload Progress Bar */}
        {isUploading && (
          <div className="w-full space-y-1 pt-1">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-400 to-[#F97316] h-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#6B7280] font-medium">
              <span>Uploading to Cloudinary...</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
