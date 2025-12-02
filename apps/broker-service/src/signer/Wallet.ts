
import { getSigner } from '@thecointech/signers';
import { ContractCore } from '@thecointech/contract-core';
import { SendMail } from '@thecointech/email';
import { log } from '@thecointech/logging';
import { ManagedNonceSigner } from './ManagedNonceSigner';
import { formatEther, parseUnits } from 'ethers';

const walletName = 'BrokerTransferAssistant';
export const GetWallet = () => getSigner(walletName);
export const GetContract = async () => {
  const signer = await getNonceSafeSigner();
  return await ContractCore.connect(signer);
}

// let signerPromise: Promise<Signer> | null = null;
async function getNonceSafeSigner() {
  // if (signerPromise === null) {
    // signerPromise = new Promise<Signer>(async resolve => {
      const signer = await GetWallet();
      // The NonceManager is not recognized as a wallet,
      // and the ConnectContract call checks other signers
      // are connected to the same network as the contract
      // const connected = process.env.CONFIG_NAME === "devlive"
      //   ? signer
      //   : signer.connect(provider);

      // Keep an eye on our ether reserves
      const signerBalance = await signer.provider!.getBalance(signer);
      log.debug({ Signer: walletName, Balance: formatEther(signerBalance) }, "Loaded {Signer} with eth reserves: ${Balance}")
      const minimumBalance = parseUnits('0.2', "ether");
      if (signerBalance < minimumBalance) {
        await SendMail(`WARNING: ${walletName} balance too low ${formatEther(signerBalance)}`, `Signer balance too low ${formatEther(signerBalance)}\nMinimum balance required: ${minimumBalance.toString()}`);
        log.error(
          { Balance: formatEther(signerBalance), MinimumBalance: formatEther(minimumBalance), Signer: walletName },
          `{Signer} ether balance too low {Balance} < {MinimumBalance}`
        );
      }

      return new ManagedNonceSigner(signer);
      // resolve(manager);
    // });
  // }
  // return signerPromise;
}
