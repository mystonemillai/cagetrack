'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { isNative } from '@/lib/native';

interface AvatarUploadProps {
  currentUrl: string | null;
  onUpload: (url: string) => void;
  size?: number;
}

export default function AvatarUpload({ currentUrl, onUpload, size = 96 }: AvatarUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [showOptions, setShowOptions] = useState(false);

  async function handleNativeCamera(source: 'CAMERA' | 'PHOTOS') {
    setShowOptions(false);
    setUploading(true);
    try {
      const w = window as any;
      const camera = w.Capacitor?.Plugins?.Camera;
      if (!camera) { fallbackToFileInput(); return; }

      const image = await camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: 'base64',
        source: source === 'CAMERA' ? 'CAMERA' : 'PHOTOS',
        width: 512,
        height: 512,
      });

      if (!image?.base64String) { setUploading(false); return; }

      // Convert base64 to blob
      const byteString = atob(image.base64String);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: `image/${image.format || 'jpeg'}` });

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${image.format || 'jpeg'}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true, contentType: `image/${image.format || 'jpeg'}` });

      if (uploadError) { alert('Upload failed. Please try again.'); setUploading(false); return; }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setPreviewUrl(publicUrl);
      onUpload(publicUrl);
      setUploading(false);
    } catch (e: any) {
      console.error('Camera error:', e);
      setUploading(false);
    }
  }

  function fallbackToFileInput() {
    setUploading(false);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) { alert('Upload failed. Please try again.'); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    setPreviewUrl(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
  }

  function handleTap() {
    if (isNative) {
      setShowOptions(true);
    } else {
      fileInputRef.current?.click();
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleTap}
        className="relative group"
        disabled={uploading}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" style={{ width: size, height: size }} className="rounded-full object-cover border-2 border-wheat/20 group-hover:border-wheat/50 transition-colors" />
        ) : (
          <div style={{ width: size, height: size }} className="rounded-full bg-navy-light border-2 border-dashed border-wheat/20 group-hover:border-wheat/50 transition-colors flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-xs text-wheat font-medium">{uploading ? 'Uploading...' : 'Change'}</span>
        </div>
      </button>

      {/* Native camera options */}
      {showOptions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowOptions(false)}>
          <div className="w-full max-w-sm mb-8 mx-4 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-navy-light">
              <button onClick={() => handleNativeCamera('CAMERA')} className="w-full p-4 text-center text-sm text-wheat border-b border-wheat/10 hover:bg-wheat/5">Take Photo</button>
              <button onClick={() => handleNativeCamera('PHOTOS')} className="w-full p-4 text-center text-sm text-wheat hover:bg-wheat/5">Choose from Library</button>
            </div>
            <button onClick={() => setShowOptions(false)} className="w-full p-4 text-center text-sm text-offwhite/40 bg-navy-light mt-2 rounded-2xl">Cancel</button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <p className="text-[10px] text-offwhite/25">{isNative ? 'Tap to take or choose a photo' : 'Click to upload photo'}</p>
    </div>
  );
}
