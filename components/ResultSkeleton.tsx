'use client';

export default function ResultSkeleton() {
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
      {/* Birth Details Skeleton */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="flex space-x-4 mb-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex space-x-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
