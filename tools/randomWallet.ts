import { Wallet } from "@ethersproject/wallet";
import { writeFileSync } from 'fs';

const password = "0nC927z!Vkka";

(async () => {
  console.log(`Generating a random wallet with password '${password}'`);

  const wallet = Wallet.createRandom();
  const encrypted = await wallet.encrypt(password);
  const filename = `random.json`;
  const filepath = new URL(filename, import.meta.url);
  writeFileSync(filepath, encrypted);
  console.log(`Address: ${wallet.address}`);
  console.log(`PK: ${wallet.privateKey}`);
})();
