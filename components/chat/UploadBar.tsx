"use client";
import { useState, useRef, useCallback } from 'react';
import { FileRef, Lang } from '@/lib/extract/types';

interface UploadBarProps {
  onFilesUploaded: (files: FileRef[]) => void;
  onFilesRemoved: (fileIds: string[]) => void;
  lang: Lang;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
}

export default function UploadBar({ 
  onFilesUploaded, 
  onFilesRemoved, 
  lang, 
  maxFiles = 5, 
  maxSize = 20,
  className = "" 
}: UploadBarProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileRef[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Validate file count
    if (files.length > maxFiles) {
      setErrors([`Maximum ${maxFiles} files allowed`]);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrors([`Files exceed ${maxSize}MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`]);
      return;
    }
    
    setIsUploading(true);
    setErrors([]);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('lang', lang);
      
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(prev => [...prev, ...result.files]);
        onFilesUploaded(result.files);
      } else {
        setErrors(result.errors || ['Upload failed']);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(['Upload failed. Please try again.']);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onFilesRemoved([fileId]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime === 'application/pdf') return '📄';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">
            {isUploading ? '⏳' : '📁'}
          </div>
          <div className="text-lg font-medium">
            {isUploading 
              ? (lang === 'ne' ? 'अपलोड हुँदै...' : 'Uploading...')
              : (lang === 'ne' ? 'फाइलहरू छान्नुहोस्' : 'Select Files')
            }
          </div>
          <div className="text-sm text-gray-600">
            {lang === 'ne' 
              ? `ड्र्याग & ड्रप वा क्लिक गर्नुहोस् (अधिकतम ${maxFiles} फाइल, ${maxSize}MB)`
              : `Drag & drop or click (max ${maxFiles} files, ${maxSize}MB)`
            }
          </div>
          <div className="text-xs text-gray-500">
            {lang === 'ne' 
              ? 'समर्थित: JPG, PNG, WebP, PDF'
              : 'Supported: JPG, PNG, WebP, PDF'
            }
          </div>
        </div>
      </div>
      
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-800">
            {lang === 'ne' ? 'त्रुटिहरू' : 'Errors'}:
          </div>
          <ul className="text-xs text-red-700 mt-1 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            {lang === 'ne' ? 'अपलोड गरिएका फाइलहरू' : 'Uploaded Files'}:
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getFileIcon(file.mime)}</span>
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.kind.toUpperCase()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  {lang === 'ne' ? 'हटाउनुहोस्' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
