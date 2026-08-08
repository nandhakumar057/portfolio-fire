import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Visible inline error banner for failed API fetches. Replaces the old
 * silent fallback-to-default-data behavior: when the API is down the user
 * sees an honest error instead of stale embedded content.
 */
export default function DataNotice({ message, onRetry, className = '' }) {
  return (
    <div role="alert" className={`alert ${className}`}>
      <AlertTriangle size={17} className="shrink-0" />
      <span className="min-w-0 flex-1">
        {message || 'Could not load content from the server.'}
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          <RotateCcw size={13} /> Retry
        </button>
      )}
    </div>
  );
}
