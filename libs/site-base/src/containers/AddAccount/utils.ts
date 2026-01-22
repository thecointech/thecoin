import { useLocation } from 'react-router';

/**
 * Hook to extract the redirect target from query parameters.
 * Returns the decoded 'from' parameter if present, otherwise returns the fallback.
 *
 * @param fallback - The default redirect path if 'from' is not present
 * @returns The decoded redirect target path
 */
export function useFromQuery(fallback: string): string {
  const location = useLocation();
  const from = new URLSearchParams(location.search).get('from');
  // Only permit 'from' redirects within the app itself
  if (from) {
    try {
      const decoded = decodeURIComponent(from);
      const url = new URL(decoded, window.location.origin);
      if (url.origin === window.location.origin) {
        return url.toString();
      }
    } catch {
      // keep default
    }
  }
  return fallback;
}


export function usePreserveQuery(to: string) {
  const { search } = useLocation();
  return `${to}${search}`;
}
