'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: string;
  required?: boolean;
  helperText?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = 'https://... or click Upload',
  folder = 'catalog',
  required = false,
  helperText = 'JPG, PNG, WebP, SVG up to 10MB',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'fallback'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setStatusMessage('Reading file...');

    // 1. Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = async (readEvent) => {
      const dataUrl = readEvent.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl); // Instant update so UI updates immediately
      }

      // 2. Upload to ImageKit via backend route
      try {
        setStatusMessage('Uploading to Cloud CDN...');
        const formData = new FormData();
        const safeName = `${folder}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        formData.append('file', file);
        formData.append('fileName', safeName);
        formData.append('folder', `casmik/${folder}`);

        const response = await fetch('/api/imagekit/upload', {
          method: 'POST',
          body: formData,
        });

        const resData = await response.json();
        if (response.ok && resData.success && resData.data?.url) {
          onChange(resData.data.url);
          setUploadStatus('success');
          setStatusMessage('Uploaded to Cloud CDN successfully!');
        } else {
          // Cloud upload failed, kept data URL
          setUploadStatus('fallback');
          setStatusMessage('Image loaded locally (Data URL)');
        }
      } catch (err: any) {
        console.warn('Cloud upload notice, using local file data:', err?.message || err);
        setUploadStatus('fallback');
        setStatusMessage('Image loaded locally');
      } finally {
        setUploading(false);
        setTimeout(() => {
          setUploadStatus('idle');
          setStatusMessage('');
        }, 3500);
      }
    };

    reader.onerror = () => {
      setUploading(false);
      alert('Failed to read file from your device.');
    };

    reader.readAsDataURL(file);

    // Reset the input value so selecting the same file triggers onChange again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
    setUploadStatus('idle');
    setStatusMessage('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Preview Thumbnail */}
        <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-inner group">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
              onError={(e) => {
                // If broken link, show subtle icon fallback
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={20} />
              <span className="text-[9px] font-medium mt-0.5">No image</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
              <Loader2 size={18} className="text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Button & Action Info */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all shadow-sm shadow-primary/20 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={14} />
                  <span>{value ? 'Change Image' : 'Upload Image'}</span>
                </>
              )}
            </button>

            {uploadStatus === 'success' && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 size={14} /> Saved to Cloud
              </span>
            )}

            {uploadStatus === 'fallback' && (
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1 animate-fade-in">
                <AlertCircle size={14} /> Loaded locally
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">{helperText}</p>
        </div>
      </div>

      {/* Direct URL input fallback */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono placeholder:font-sans placeholder:text-gray-400 bg-white"
        />
      </div>
    </div>
  );
}
