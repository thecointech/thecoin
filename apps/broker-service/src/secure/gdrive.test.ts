import { log } from '@thecointech/logging';
import {getAuthUrl} from './gdrive'

test("Generates auth URL ", () => {

	const url = getAuthUrl('http://localhost:3001/gauth');
	expect(url).toBeTruthy();

  log.level(100);
  expect(() => getAuthUrl('invalid_url')).toThrow()
})
