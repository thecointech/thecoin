import React from 'react'

function getUrlParams(search: string) {
	let hashes = search.slice(search.indexOf('?') + 1).split('&')
	let params = {}
	hashes.map(hash => {
			let [key, val] = hash.split('=')
			params[key] = decodeURIComponent(val)
	})

	return params
}

export interface IWindow extends Window {
	completeGauthLogin?: (query: string) => Promise<void>
}

export function GAuth() {
	// Store appropriate bits and bobs in a cookie
	let query = window.location.search;
	const params = getUrlParams(query);
	if (params && params['code']) {
		const code = params['code'];
		const opener: IWindow = window.opener;
		if (opener && opener.completeGauthLogin) {
			opener.completeGauthLogin(code);
		}
		else {
			// If we can't call that function, set the cookie data instead
			document.cookie = `gauth=${encodeURI(code)}; path=/`
			//window.close();
		}	
	}
	
	return (
	<>
		<div>Thank you for completing Google Authorization: This window can now be closed.</div>
	</>
	);
}