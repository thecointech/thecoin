import { getSigner, AccountName } from '@thecointech/signers';
import { getProvider } from '@thecointech/ethers-provider';
import { HDNodeWallet } from 'ethers';

const provider = getProvider();
async function printDetails(name: AccountName) {
  const signer = await getSigner(name);
  const address = await signer.getAddress();
  const balance = await signer.provider?.getBalance(address);
  const asWallet = signer as HDNodeWallet;
  console.log(`Wallet: ${name} ${address} ${balance} ${asWallet.mnemonic?.phrase}`);
}

await printDetails("Owner")
await printDetails("BrokerCAD")
await printDetails("BrokerTransferAssistant")
await printDetails("OracleOwner")
await printDetails("OracleUpdater")
await printDetails("TheCoin")
