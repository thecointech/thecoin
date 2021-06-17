const { readFileSync, writeFileSync, copyFile, mkdirSync } = require('fs');
const yaml = require('js-yaml');
const path = require('path');


// writeFileSync("./src/index.ts", output);
// To keep this in sync with our build expectations,
// we also directly export this as a types file to our build folder
// This isn't stricly necessary, but it's nice to be consistent
mkdirSync(outPath, {recursive: true});
writeFileSync(`${outPath}/index.d.ts`, output);
