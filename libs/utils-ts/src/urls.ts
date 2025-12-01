// Get search params from the URL
export function getUrlParameterByName(name: string, url?: string) {
  const targetUrl = url || window.location.href;
  const parts = targetUrl.split('?');
  for (let i = 1; i < parts.length; i++) {
    const params = new URLSearchParams(parts[i].split('#')[0]); // Remove hash after params
    const value = params.get(name);
    if (value) return value;
  }

  return null;
}
