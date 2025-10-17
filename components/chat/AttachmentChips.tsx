"use client";
import { FileRef, Lang } from '@/lib/extract/types';

interface AttachmentChipsProps {
  files: FileRef[];
  onRemove: (fileId: string) => void;
  lang: Lang;
  className?: string;
}

export default function AttachmentChips({ 
  files, 
  onRemove, 
  lang, 
  className = "" 
}: AttachmentChipsProps) {
  if (files.length === 0) return null;

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime === 'application/pdf') return '📄';
    return '📁';
  };

  const getFileTypeColor = (kind: string) => {
    switch (kind) {
      case 'image': return 'bg-blue-100 text-blue-800';
      case 'pdf': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {files.map((file) => (
        <div
          key={file.id}
          className={`
            inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
            ${getFileTypeColor(file.kind)}
          `}
        >
          <span className="text-sm">{getFileIcon(file.mime)}</span>
          <span className="font-medium truncate max-w-32">{file.name}</span>
          <span className="text-xs opacity-75">{formatFileSize(file.size)}</span>
          <button
            onClick={() => onRemove(file.id)}
            className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
            title={lang === 'ne' ? 'हटाउनुहोस्' : 'Remove'}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
