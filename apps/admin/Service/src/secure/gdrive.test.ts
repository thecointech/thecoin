import {getAuthUrl} from './gdrive'

test("Generates auth URL ", () => {

	const url = getAuthUrl();
	expect(url).toBeTruthy();
})