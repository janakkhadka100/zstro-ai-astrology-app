"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, ExternalLink, MessageSquare, Trash2 } from "lucide-react";
import { UploadedFile } from "@/hooks/useUploads";

interface FileCardsProps {
  items: UploadedFile[];
  onSendToChat: (text: string) => void;
  onRemove?: (url: string) => void;
}

export default function FileCards({ items, onSendToChat, onRemove }: FileCardsProps) {
  if (!items?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Uploaded Files ({items.length})
      </h3>
      
      <div className="grid gap-4">
        {items.map((file, index) => (
          <Card key={`${file.url}-${index}`} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {file.type.startsWith("image/") ? (
                    <Image className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500" />
                  )}
                  <CardTitle className="text-sm font-medium truncate">
                    {file.name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {file.type.split("/")[1].toUpperCase()}
                  </Badge>
                  {onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(file.url)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Image Preview */}
              {file.type.startsWith("image/") && (
                <div className="relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full max-h-40 object-cover rounded-lg border"
                    loading="lazy"
                  />
                  {file.meta && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {file.meta.width} × {file.meta.height}px
                      {file.meta.format && ` • ${file.meta.format.toUpperCase()}`}
                    </div>
                  )}
                </div>
              )}

              {/* PDF Content */}
              {file.type === "application/pdf" && file.text && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Extracted text ({file.text.length} characters)
                  </div>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-3 text-xs bg-gray-50 dark:bg-gray-800">
                    <pre className="whitespace-pre-wrap font-sans">
                      {file.text.slice(0, 600)}
                      {file.text.length > 600 && "..."}
                    </pre>
                  </div>
                  {file.meta && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {file.meta.pages} pages
                    </div>
                  )}
                </div>
              )}

              {/* Image OCR Note */}
              {file.type.startsWith("image/") && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {file.text || "OCR not enabled - image preview only"}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(file.url, "_blank")}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
                
                {file.text && (
                  <Button
                    size="sm"
                    onClick={() => onSendToChat(file.text || "")}
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Send to Chat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
