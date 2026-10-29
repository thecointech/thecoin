import { getSigner, type AccountName } from '@thecointech/signers';
import { HDNodeWallet } from 'ethers';

async function printDetails(name: AccountName) {
  const signer = await getSigner(name);
  const address = await signer.getAddress();
  const balance = await signer.provider?.getBalance(address);
  const asWallet = signer as HDNodeWallet;
  console.log(`Wallet: ${name} ${address} ${balance} ${asWallet.mnemonic?.phrase}`);
}

await printDetails("Owner")
await printDetails("TheCoin")
await printDetails("BrokerCAD")
await printDetails("BrokerTransferAssistant")
await printDetails("Minter")
await printDetails("Police")
await printDetails("OracleOwner")
await printDetails("OracleUpdater")
await printDetails("TestDemoAccount")
