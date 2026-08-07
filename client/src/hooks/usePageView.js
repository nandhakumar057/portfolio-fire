import { useEffect, useRef } from 'react';
import { trackView } from '../api';

const SESSION_KEY = 'pf_session';

/**
 * Fires lightweight analytics on route changes: one track per (path, day)
 * plus a one-time `visit` flag per browser session for the visitor count.
 * Swallows errors — analytics must never break the site.
 */
export default function usePageView(path) {
  const lastPath = useRef('');

  useEffect(() => {
    if (!path || path.startsWith('/admin')) return undefined;
    if (lastPath.current === path) return undefined;
    lastPath.current = path;

    const day = new Date().toISOString().slice(0, 10);
    let visit = false;
    try {
      if (!localStorage.getItem(SESSION_KEY)) {
        localStorage.setItem(SESSION_KEY, day);
        visit = true;
      }
    } catch {
      /* ignore */
    }

    const key = `pf_view_${path}_${day}`;
    let shouldTrack = true;
    try {
      shouldTrack = !localStorage.getItem(key);
      if (shouldTrack) localStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }

    if (shouldTrack) {
      trackView({ path, visit }).catch(() => {});
    }
  }, [path]);
}
