import fs from 'fs';
import { URL } from 'url';

let translationFR = new URL(`./fr.json`, import.meta.url);
let translationEN = new URL(`./en.json`, import.meta.url);

test("Check that the translation file FR is here", async () => {
    expect(fs.existsSync(translationFR)).toBe(true);
});
test("Check that the translation file FR is JSON", async () => {
    try {
        JSON.parse(fs.readFileSync(translationFR, 'utf8'));
      } catch (e) {
        expect(e).toMatch('error');
      }
});

test("Check that the translation file EN is here", async () => {
    expect(fs.existsSync(translationEN)).toBe(true);
});
test("Check that the translation file EN is JSON", async () => {
    try {
        JSON.parse(fs.readFileSync(translationEN, 'utf8'));
      } catch (e) {
        expect(e).toMatch('error');
      }
});
