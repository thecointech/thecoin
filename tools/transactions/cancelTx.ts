import { Wallet } from '@ethersproject/wallet';
import { readFileSync } from 'fs';
import { DateTime } from 'luxon';
import { getProvider } from '@thecointech/ethers-provider';
import { toCoin } from '@thecointech/utilities';
import { getSigner } from '@thecointech/signers';
import { connect } from '@thecointech/contract-base/connect';

async function cancelXfer() {

  const provider = getProvider();
  const fees = await provider.getFeeData();
  const gasPrice  = Math.floor(fees!.gasPrice!.toNumber() * 2);
  console.log("Fees: " + gasPrice / 1000000000);

  const broker = await getSigner('BrokerCAD');
  const address = await broker.getAddress();
  const nonce = await provider.getTransactionCount(address);
  const pending = await provider.getTransactionCount(address, "pending");

  console.log(`Nonce: ${nonce}, pending: ${pending}`);

  if (nonce < pending) {
    console.log(`Cancelling tx: ${nonce}`);
    try {
      const connected = broker.connect(provider);
      const tx = await connected.sendTransaction({
        to: address,
        value: 0,
        nonce,
      });
      console.log(`Tx sent: ${tx.hash}`);
      await tx.wait(2);
    }
    catch (e: any) {
      console.error(`Error happened: ${e.message}`);
    }
  }
}

cancelXfer()
