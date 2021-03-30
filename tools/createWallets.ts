import { AccountId } from '@thecointech/accounts';
import {Wallet} from "ethers";
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import {resolve} from 'path';

const password = "0nC927z!Vkka";
const prodtestFolder = resolve(__dirname, '..', 'environments', 'prodtest');
const outputFolder = resolve(prodtestFolder, 'wallets');
if (!existsSync(outputFolder))
  mkdirSync(outputFolder, { recursive: true });

(async () => {
  const generatedDeets = [];

  for (const name in AccountId) {
    if(!/^\d+$/.test(name)) {
      console.log(name);
      const wallet = Wallet.createRandom();
      const encrypted = await wallet.encrypt(password);
      const filename = `${name}.json`;
      const filepath = resolve(outputFolder, filename);
      writeFileSync(resolve(outputFolder, filename), encrypted);

      generatedDeets.push(`WALLET_${name}_PATH=${filepath}`)
      generatedDeets.push(`WALLET_${name}_KEY=${password}`)
    }
  }
  writeFileSync(resolve(prodtestFolder, "wallets.env"), generatedDeets.join('\n'));
})();
