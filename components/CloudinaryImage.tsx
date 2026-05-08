// components/CloudinaryImage.tsx
'use client';

import { CldImage } from 'next-cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function CloudinaryImage({ 
  src, 
  alt, 
  width = 200, 
  height = 200,
  className = ''
}: CloudinaryImageProps) {
  // If no src or src is empty, don't render
  if (!src || src === '') {
    return <span className="text-4xl">👤</span>;
  }
  
  // Extract public ID from Cloudinary URL if full URL is provided
  let publicId = src;
  if (src.includes('cloudinary.com')) {
    const parts = src.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
      publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
    }
  }
  
  // If still no valid publicId, show placeholder
  if (!publicId || publicId === '') {
    return <span className="text-4xl">👤</span>;
  }
  
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      crop={{
        type: 'auto',
        source: true,
        gravity: 'face'
      }}
      className={className}
      loading="lazy"
    />
  );
}