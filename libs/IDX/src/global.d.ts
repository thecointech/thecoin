// Weird TS error complains about an import in @tendermint/sig
// ../../node_modules/@tendermint/sig/src/hash.ts:3:24 - error TS7016: Could not find a declaration file for module 'create-hash'. 'C:/src/TheCoin/node_modules/create-hash/index.js' implicitly has an 'any' type.
// Try `npm i --save-dev @types/create-hash` if it exists or add a new declaration (.d.ts) file containing `declare module 'create-hash';`
declare module 'create-hash';
