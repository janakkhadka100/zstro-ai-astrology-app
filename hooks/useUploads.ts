"use client";
import { useState } from "react";

export interface UploadedFile {
  url: string;
  type: string;
  name: string;
  text?: string;
  meta?: any;
}

export function useUploads() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadedFile | null> => {
    setUploading(true);
    setError(null);

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.ok) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      // Extract content
      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadResult.file.url,
          type: uploadResult.file.type,
        }),
      });

      const extractResult = await extractResponse.json();

      if (!extractResult.ok) {
        throw new Error(extractResult.error || "Content extraction failed");
      }

      const uploadedFile: UploadedFile = {
        url: uploadResult.file.url,
        type: uploadResult.file.type,
        name: uploadResult.file.name,
        text: extractResult.content?.text,
        meta: extractResult.content?.meta,
      };

      // Add to files list
      setFiles(prev => [uploadedFile, ...prev]);
      return uploadedFile;

    } catch (err: any) {
      const errorMessage = err?.message || "Upload failed";
      setError(errorMessage);
      console.error("Upload error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const add = (file: UploadedFile) => {
    setFiles(prev => [file, ...prev]);
  };

  const remove = (url: string) => {
    setFiles(prev => prev.filter(file => file.url !== url));
  };

  const clear = () => {
    setFiles([]);
    setError(null);
  };

  return {
    files,
    uploading,
    error,
    upload,
    add,
    remove,
    clear,
    setError
  };
}
