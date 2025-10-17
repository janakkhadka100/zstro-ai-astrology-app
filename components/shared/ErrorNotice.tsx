// components/shared/ErrorNotice.tsx
// Centralized error handling with localized messages

"use client";

import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getString, type Lang } from "@/lib/utils/i18n";

interface ErrorNoticeProps {
  error: string;
  lang: Lang;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "error" | "warning" | "info";
  className?: string;
}

export function ErrorNotice({ 
  error, 
  lang, 
  onRetry, 
  onDismiss, 
  variant = "error",
  className 
}: ErrorNoticeProps) {
  const getErrorIcon = () => {
    switch (variant) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getErrorStyles = () => {
    switch (variant) {
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
      default:
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
    }
  };

  return (
    <div className={cn(
      "flex items-start space-x-3 p-4 rounded-lg border",
      getErrorStyles(),
      className
    )}>
      {getErrorIcon()}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {getString("error", lang)}
        </p>
        <p className="text-sm mt-1">
          {error}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1 text-sm font-medium hover:underline"
            title={getString("retry", lang)}
          >
            <RefreshCw className="h-4 w-4" />
            <span>{getString("retry", lang)}</span>
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            title={getString("close", lang)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Specific error types with predefined messages
interface SpecificErrorNoticeProps {
  errorType: keyof Pick<ReturnType<typeof getString>, 
    "dataLoadFailed" | "fileFormatNotSupported" | "fileScanFailed" | 
    "networkError" | "validationError" | "rateLimitExceeded">;
  lang: Lang;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function SpecificErrorNotice({ 
  errorType, 
  lang, 
  onRetry, 
  onDismiss, 
  className 
}: SpecificErrorNoticeProps) {
  return (
    <ErrorNotice
      error={getString(errorType, lang)}
      lang={lang}
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
    />
  );
}

// Loading state with error fallback
interface LoadingWithErrorProps {
  isLoading: boolean;
  error: string | null;
  lang: Lang;
  onRetry?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}

export function LoadingWithError({ 
  isLoading, 
  error, 
  lang, 
  onRetry, 
  children, 
  skeleton,
  className 
}: LoadingWithErrorProps) {
  if (error) {
    return (
      <ErrorNotice
        error={error}
        lang={lang}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={className}>
        {skeleton || <Skeleton variant="card" />}
      </div>
    );
  }

  return <>{children}</>;
}

// Success notice
interface SuccessNoticeProps {
  message: string;
  lang: Lang;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessNotice({ 
  message, 
  lang, 
  onDismiss, 
  className 
}: SuccessNoticeProps) {
  return (
    <div className={cn(
      "flex items-center space-x-3 p-4 rounded-lg border",
      "bg-green-50 border-green-200 text-green-800",
      "dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
      className
    )}>
      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
        <span className="text-white text-xs font-bold">✓</span>
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">
          {getString("success", lang)}
        </p>
        <p className="text-sm mt-1">
          {message}
        </p>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-300"
          title={getString("close", lang)}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
