"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Image, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UploadBoxProps {
  onUploaded: (file: { url: string; type: string; name: string; text?: string; meta?: any }) => void;
  uploading?: boolean;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export default function UploadBox({ onUploaded, uploading = false, onUploadStart, onUploadEnd }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const maxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || "20");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    
    const file = files[0];
    onUploadStart?.();

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

      const uploadedFile = {
        url: uploadResult.file.url,
        type: uploadResult.file.type,
        name: uploadResult.file.name,
        text: extractResult.content?.text,
        meta: extractResult.content?.meta,
      };

      onUploaded(uploadedFile);
      toast.success(`${file.name} uploaded successfully!`);

    } catch (error: any) {
      const errorMessage = error?.message || "Upload failed";
      toast.error(errorMessage);
      console.error("Upload error:", error);
    } finally {
      onUploadEnd?.();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
              : "border-gray-300 dark:border-gray-600"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              {uploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              ) : (
                <FileText className="h-12 w-12 mx-auto" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {uploading ? "Uploading..." : "Drag & drop files here"}
            </p>
            
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              PDF, PNG, JPEG, WebP (max {maxMb}MB)
            </p>

            <Button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              variant="outline"
              size="sm"
            >
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <AlertCircle className="h-4 w-4" />
          <span>Files are processed securely and stored temporarily</span>
        </div>
      </CardContent>
    </Card>
  );
}
