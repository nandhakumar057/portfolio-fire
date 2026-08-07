import { useEffect } from 'react';

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value || '');
}

/**
 * Sets per-page SEO metadata: document title, description, Open Graph,
 * Twitter cards, and a canonical URL.
 */
const SITE_URL = import.meta.env.VITE_SITE_URL || '';

/**
 * Sets per-page SEO metadata: document title, description, Open Graph,
 * Twitter cards, and a canonical URL.
 *
 * Canonicals use VITE_SITE_URL when configured (production domain) so local
 * or preview builds don't pollute search indexes; otherwise they fall back
 * to the current origin.
 */
export default function usePageMeta({ title, description, image = '', type = 'website' }) {
  useEffect(() => {
    const { pathname, search } = window.location;
    const origin = SITE_URL || window.location.origin;
    const url = `${origin}${pathname}${search}`;

    document.title = title;
    setMeta('name', 'description', description);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    if (image) setMeta('property', 'og:image', image);

    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (image) setMeta('name', 'twitter:image', image);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, image, type]);
}
