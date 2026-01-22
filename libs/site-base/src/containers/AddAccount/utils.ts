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
  return from ? decodeURIComponent(from) : fallback;
}
