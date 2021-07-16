import {getAuthUrl} from './gdrive'

test("Generates auth URL ", () => {

	const url = getAuthUrl('http://localhost:3001/gauth');
	expect(url).toBeTruthy();

  expect(() => getAuthUrl('invalid_url')).toThrow()
})
