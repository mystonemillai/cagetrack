'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase-browser';

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    setPreviewUrl(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative group"
        disabled={uploading}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            style={{ width: size, height: size }}
            className="rounded-full object-cover border-2 border-wheat/20 group-hover:border-wheat/50 transition-colors"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="rounded-full bg-navy-light border-2 border-dashed border-wheat/20 group-hover:border-wheat/50 transition-colors flex items-center justify-center"
          >
            <span className="text-2xl">📷</span>
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-xs text-wheat font-medium">{uploading ? 'Uploading...' : 'Change'}</span>
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-[10px] text-offwhite/25">Click to upload photo</p>
    </div>
  );
}
