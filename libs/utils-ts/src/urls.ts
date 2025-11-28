// A collection of functions for accessing website localState


// Get search params from the URL
export function getUrlParameterByName(name: string, url?: string) {
  const targetUrl = url || window.location.href;
  const urlObj = new URL(targetUrl);
  return urlObj.searchParams.get(name);
}
