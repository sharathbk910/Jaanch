import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-page flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8 border-hairline">
            <div className="w-12 h-12 bg-status-concern-bg text-status-concern-fg border border-status-concern-border rounded-btn flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h1 className="font-serif text-xl font-bold text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-body mb-6">
              An unexpected error occurred while rendering this view. Your input has not been compromised.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => (window.location.href = '/')}>
                <Home size={14} className="mr-1.5" />
                Go Home
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleReset}>
                <RefreshCw size={14} className="mr-1.5" />
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

