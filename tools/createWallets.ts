import { AccountId } from '@thecointech/signers';
import { Wallet } from "ethers";
import { writeFileSync, existsSync, mkdirSync, readFile, readFileSync } from 'fs';
import { resolve } from 'path';

const password = "0nC927z!Vkka";
const outfolder = process.env.THECOIN_ENVIRONMENTS!;
const environment = process.argv[2]
const name = process.argv[3]
const prodtestFolder = resolve(outfolder, environment);
const outputFolder = resolve(prodtestFolder, 'wallets');
if (!existsSync(outputFolder)) {
  throw new Error('output folder does not exist');
}

const generatedDeets: string[] = [];

if (!AccountId[name]) {
  throw new Error(`Invalid name ${name}`);
}

console.log(name);
const wallet = Wallet.createRandom();
const encrypted = await wallet.encrypt(password);
const filename = `${name}.json`;
const filepath = resolve(outputFolder, filename);
writeFileSync(resolve(outputFolder, filename), encrypted);

generatedDeets.push(`WALLET_${name}_PATH=${filepath}`)
generatedDeets.push(`WALLET_${name}_PWD=${password}`)
generatedDeets.push(`WALLET_${name}_KEY=${wallet._signingKey().privateKey}`)

// read existing wallets
const envFile = resolve(prodtestFolder, "wallets.env");
const existing = readFileSync(envFile, 'utf8')
writeFileSync(envFile, `${existing}\n${generatedDeets.join('\n')}`);
