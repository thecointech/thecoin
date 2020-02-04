// A collection of functions for accessing website localState


// Get search params from the URL
export function getUrlParams() {
  return new URLSearchParams(window.location.search);
} 


// Given a cookie key `name`, returns the value of
// the cookie or `null`, if the key is not found.
export function getCookie(name: string) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
	return (parts.length == 2) ?
		decodeURI(parts.pop()!.split(";").shift()!) :
		'';
}