// lib/perf/images.ts
// Image optimization utilities for Next.js

import Image from 'next/image';
import { useState } from 'react';

// Image optimization configuration
export const IMAGE_CONFIG = {
  // Supported formats
  formats: ['image/webp', 'image/avif', 'image/jpeg', 'image/png'],
  
  // Quality settings
  quality: {
    high: 90,
    medium: 75,
    low: 60,
  },
  
  // Sizes for responsive images
  sizes: {
    thumbnail: '(max-width: 150px) 150px, 150px',
    small: '(max-width: 300px) 300px, 300px',
    medium: '(max-width: 600px) 600px, 600px',
    large: '(max-width: 1200px) 1200px, 1200px',
    full: '100vw',
  },
  
  // Placeholder configurations
  placeholder: {
    blur: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    empty: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  },
} as const;

// Image component with optimization
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: 'high' | 'medium' | 'low';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
  className?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  quality = 'medium',
  priority = false,
  placeholder = 'blur',
  sizes = IMAGE_CONFIG.sizes.medium,
  className = '',
  onClick,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={IMAGE_CONFIG.quality[quality]}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={
          placeholder === 'blur'
            ? IMAGE_CONFIG.placeholder.blur
            : IMAGE_CONFIG.placeholder.empty
        }
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
      />
    </div>
  );
}

// Lazy loading image component
interface LazyImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: LazyImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={false}
      sizes={props.sizes || IMAGE_CONFIG.sizes.medium}
    />
  );
}

// Avatar image component
interface AvatarImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  className = '',
}: AvatarImageProps) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const pixelSize = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      quality="high"
      className={`rounded-full ${className}`}
      sizes={IMAGE_CONFIG.sizes.thumbnail}
    />
  );
}

// Card image component for astrology cards
interface CardImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  onClick?: () => void;
}

export function CardImage({
  src,
  alt,
  title,
  className = '',
  onClick,
}: CardImageProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={300}
        height={200}
        quality="medium"
        sizes={IMAGE_CONFIG.sizes.medium}
        className="w-full h-full object-cover"
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
          {title}
        </div>
      )}
    </div>
  );
}

// Gallery image component
interface GalleryImageProps {
  src: string;
  alt: string;
  index: number;
  onClick?: (index: number) => void;
  className?: string;
}

export function GalleryImage({
  src,
  alt,
  index,
  onClick,
  className = '',
}: GalleryImageProps) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform ${className}`}
      onClick={() => onClick?.(index)}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={400}
        height={400}
        quality="medium"
        sizes={IMAGE_CONFIG.sizes.medium}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height: number,
  quality: 'high' | 'medium' | 'low' = 'medium'
): string {
  // In a real implementation, this would use a service like Cloudinary or Vercel's Image Optimization
  // For now, return the original src
  return src;
}

export function generateImagePlaceholder(width: number, height: number): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui">Loading...</text>
    </svg>`
  ).toString('base64')}`;
}

// Image format detection
export function getImageFormat(src: string): string {
  const extension = src.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

// Image size validation
export function validateImageSize(
  file: File,
  maxWidth: number = 2048,
  maxHeight: number = 2048,
  maxSize: number = 5 * 1024 * 1024 // 5MB
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Note: In a real implementation, you'd need to check actual image dimensions
  // This is a simplified validation
  return { valid: true };
}

// Image compression utilities
export function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
