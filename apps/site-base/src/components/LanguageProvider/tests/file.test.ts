import {} from 'jest'
import path from 'path';
const fs = require('fs');

let translationFR = path.join(__dirname, `../../../translations/fr.json`);
let translationEN = path.join(__dirname, `../../../translations/en.json`);

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
