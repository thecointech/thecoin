const { readFileSync, writeFileSync, copyFile, mkdirSync } = require('fs');
const swaggerToTS = require('@manifoldco/swagger-to-ts').default;
const yaml = require('js-yaml');
const path = require('path');

console.log(`
Building TheCoin types from broker.yaml
`)

const root = path.resolve(__dirname, "..", "..")
const yamlPath = path.resolve(root, "apis", "broker-cad.yaml");
const outPath = path.resolve(root, "build", "types")
console.log("Writing types to: " + outPath)
mkdirSync(outPath, { recursive: true })

file = readFileSync(yamlPath, 'utf8');
const input = yaml.safeLoad(file); // Input be any JS object (OpenAPI format)
const output = swaggerToTS(input, {
    wrapper: false,
    injectWarning: true,
  }); // Outputs TypeScript defs as a string (to be parsed, or written to a file)

writeFileSync("./src/BrokerCAD.d.ts", output);
// To keep this in sync with our build expectations,
// we also directly export this as a types file to our build folder
// This isn't stricly necessary, but it's nice to be consistent
//writeFileSync(`${outPath}/index.d.ts`, output);


// destination.txt will be created or overwritten by default.
// copyFile('./src/FirebaseFirestore.d.ts', `${outPath}/FirebaseFirestore.d.ts`, (err) => {
//   if (err) throw err;
//   console.log('Copied common firestore types');
// });
