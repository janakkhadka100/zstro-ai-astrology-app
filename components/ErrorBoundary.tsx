"use client";
import React from "react";
export default class ErrorBoundary extends React.Component<{children: React.ReactNode},{error?:Error}> {
  state = { error: undefined as Error|undefined };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return <div className="m-4 rounded-xl border p-4 text-red-600 bg-red-50">UI error: {this.state.error.message}</div>;
    return this.props.children;
  }
}