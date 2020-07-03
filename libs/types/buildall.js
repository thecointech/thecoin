const { readFileSync, writeFileSync, copyFile, mkdirSync } = require('fs');
//const swaggerToTS = require('@manifoldco/swagger-to-ts').default;
const swaggerToTS = require('./swagger-to-ts').default;
const yaml = require('js-yaml');
const path = require('path');

console.warn(`
!!! NOTE: !!!
 We are using a local version of swagger-to-ts, until the following issue is resolved:
 https://github.com/manifoldco/swagger-to-ts/issues/111

 Once fixed, remove our local build and go back to the NPM version
`)

const root = path.resolve(__dirname, "..", "..")
const yamlPath = path.resolve(root, "apis", "broker-cad.yaml");
const outPath = path.resolve(root, "build", "types")
console.log("Writing types to: " + outPath)
file = readFileSync(yamlPath, 'utf8');
const input = yaml.safeLoad(file); // Input be any JS object (OpenAPI format)
const output = swaggerToTS(input, {
    wrapper: false,
    injectWarning: true,
  }); // Outputs TypeScript defs as a string (to be parsed, or written to a file)

writeFileSync("./src/index.ts", output);
// To keep this in sync with our build expectations,
// we also directly export this as a types file to our build folder
// This isn't stricly necessary, but it's nice to be consistent
mkdirSync(outPath, {recursive: true});
writeFileSync(`${outPath}/index.d.ts`, output);


// destination.txt will be created or overwritten by default.
copyFile('./src/FirebaseFirestore.d.ts', `${outPath}/FirebaseFirestore.d.ts`, (err) => {
  if (err) throw err;
  console.log('Copied common firestore types');
});
