import { getSigner, AccountName } from '@thecointech/signers';
import { getProvider } from '@thecointech/ethers-provider';
import { Wallet } from 'ethers';

const provider = getProvider();
async function printDetails(name: AccountName) {
  const raw = await getSigner(name);
  const signer = raw.connect(provider);
  const address = await signer.getAddress();
  const balance = await signer.getBalance();
  const asWallet = signer as Wallet;
  console.log(`Wallet: ${name} ${address} ${balance} ${asWallet.mnemonic?.phrase}`);
}

await printDetails("Owner")
await printDetails("BrokerCAD")
await printDetails("BrokerTransferAssistant")
await printDetails("OracleOwner")
await printDetails("OracleUpdater")
await printDetails("TheCoin")
