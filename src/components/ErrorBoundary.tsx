import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — Catches unhandled React errors gracefully.
 * 
 * Security consideration (MobSF INFO):
 * - Prevents full app crash from exposing internal state
 * - Sanitizes error messages shown to users (no stack traces)
 * - Provides graceful recovery path
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // In production, send to error tracking service (e.g., Sentry)
    // Never log raw errors to console in production
    if (import.meta.env.DEV) {
      // Only log in development
      console.error("ErrorBoundary caught:", _error);
    }
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
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              An unexpected error occurred. Please try again or contact support if the issue persists.
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
