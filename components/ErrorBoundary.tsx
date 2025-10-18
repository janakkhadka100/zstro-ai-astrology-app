'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="m-4 rounded-xl border p-4 text-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Error: {this.state.error?.message || 'Something went wrong'}</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300 mb-3">
            There was an error loading this section. Please try refreshing the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-500 dark:text-red-400 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
