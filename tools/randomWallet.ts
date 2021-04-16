
import {Wallet} from "ethers";
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import {resolve} from 'path';

const password = "random";

(async () => {
  console.log("Generating a random wallet with password 'random'");

  const wallet = Wallet.createRandom();
  const encrypted = await wallet.encrypt(password);
  const filename = `random.json`;
  const filepath = resolve(__dirname, filename);
  writeFileSync(filepath, encrypted);
})();
