import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/** Prevents a single runtime error from white-screening the whole SPA. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-px flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-edge bg-card text-white">
            <AlertTriangle size={30} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-muted">
            An unexpected error occurred while rendering this page. Reloading usually fixes it.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-8">
            <RefreshCw size={16} /> Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
