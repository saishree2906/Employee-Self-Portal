import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Upload, Loader2 } from 'lucide-react';
import api from '../../api/mockInterceptors';

function centeredCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
    width,
    height,
  );
}

function getCroppedBlob(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas  = document.createElement('canvas');
  const scaleX  = image.naturalWidth  / image.width;
  const scaleY  = image.naturalHeight / image.height;
  const size    = 200;
  canvas.width  = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width  * scaleX,
    crop.height * scaleY,
    0, 0, size, size,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas is empty')),
      'image/jpeg',
      0.92,
    );
  });
}

interface Props {
  imageSrc:        string;
  onClose:         () => void;
  onUploadSuccess: (newUrl: string) => void;
}

export default function AvatarCropModal({ imageSrc, onClose, onUploadSuccess }: Props) {
  const imgRef                    = useRef<HTMLImageElement>(null);
  const [crop, setCrop]           = useState<Crop>();
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centeredCrop(width, height));
  }, []);

  const handleConfirm = async () => {
    if (!imgRef.current || !crop) return;
    setUploading(true);
    setError(null);

    try {
      const blob = await getCroppedBlob(imgRef.current, crop);

      if (blob.size > 2 * 1024 * 1024) {
        setError('Image too large. Please crop a smaller area (max 2MB).');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');

      const res = await api.post('/employees/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUploadSuccess(res.data.profilePhotoUrl);
      onClose();

    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Crop Profile Photo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex items-center justify-center bg-gray-50 p-4 min-h-[260px]">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            aspect={1}
            circularCrop
            minWidth={60}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Crop preview"
              style={{ maxHeight: '320px', maxWidth: '100%' }}
            />
          </ReactCrop>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 text-center py-2">
          Drag to reposition · Resize the circle to crop
        </p>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center px-5 pb-2">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={uploading || !crop}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              : <><Upload className="w-4 h-4" /> Upload Photo</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}