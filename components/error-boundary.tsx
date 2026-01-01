"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card variant="muted" className="p-8 text-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">خطایی رخ داد</h2>
          <p className="text-muted-foreground text-sm mb-6">
            متأسفانه مشکلی پیش آمده. لطفاً دوباره تلاش کنید.
          </p>
          <Button onClick={this.handleReset} className="gap-2">
            <RefreshCw size={16} />
            تلاش مجدد
          </Button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-4 p-4 bg-rose-50 rounded-lg text-xs text-rose-800 text-left overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
        </Card>
      );
    }

    return this.props.children;
  }
}
