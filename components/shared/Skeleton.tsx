// components/shared/Skeleton.tsx
// Generic skeleton loading components

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = "default", 
  width, 
  height 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded";
  
  const variantClasses = {
    default: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    text: "h-4 w-3/4",
    circle: "h-8 w-8 rounded-full",
    rect: "h-20 w-full rounded"
  };

  const style = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && { height: typeof height === "number" ? `${height}px` : height })
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// Card skeleton for astrology cards
export function AstroCardSkeleton() {
  return (
    <div className="rounded-2xl shadow p-4 space-y-3">
      <Skeleton variant="text" className="h-6 w-1/3" />
      <div className="grid md:grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded p-2 space-y-2">
            <Skeleton variant="text" className="h-4 w-1/2" />
            <Skeleton variant="text" className="h-3 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Chat message skeleton
export function ChatMessageSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <Skeleton variant="circle" className="size-8" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-1/4" />
          <div className="space-y-1">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-5/6" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-1/4" />
        <Skeleton variant="rect" className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-1/3" />
        <Skeleton variant="rect" className="h-20 w-full" />
      </div>
      <div className="flex space-x-2">
        <Skeleton variant="rect" className="h-10 w-20" />
        <Skeleton variant="rect" className="h-10 w-20" />
      </div>
    </div>
  );
}

// List skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <Skeleton variant="circle" className="size-8" />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" className="h-4 w-1/2" />
            <Skeleton variant="text" className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
