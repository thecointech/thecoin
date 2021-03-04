import { GetContract } from './Wallet';
import { certifiedFee } from '../status/constant.json';
import { GetTransferSigner } from '@the-coin/utilities/VerifiedTransfer';
import { CertifiedTransferRequest, CertifiedTransferResponse } from '../types';
import { TransactionResponse } from 'ethers/providers';

function success(val: string | undefined): CertifiedTransferResponse {
  if (!val) {
    console.error('Success hash undefined');
    return {
      message: 'TxHash was undefined',
      txHash: 'Undefined'
    };
  }
  return {
    message: 'Success',
    txHash: val
  };
}

function failure(val: string): CertifiedTransferResponse {
  console.log('Tx Failure, ', val);
  return {
    message: val,
    txHash: ''
  };
}

function FeeValid(transfer: CertifiedTransferRequest) {
  return transfer.fee == certifiedFee;
}
async function AvailableBalance(transfer: CertifiedTransferRequest) {
	const contract = await GetContract();
  const userBalance = await contract.balanceOf(transfer.from);
  return userBalance.toNumber() >= transfer.fee + transfer.value;
}
function ValidXfer(transfer: CertifiedTransferRequest) {
  return GetTransferSigner(transfer) == transfer.from;
}

async function DoCertifiedTransferWaitable(transfer: CertifiedTransferRequest) {
  // First check: is this the right sized fee?
  if (!FeeValid(transfer))
    // TODO: Is that even remotely the right size?
    throw new Error('Invalid fee present');

  // Next, verify the xfer request
  if (!ValidXfer(transfer)) throw new Error('Invalid xfer');

  // Next, check that user have available balance
  if (!(await AvailableBalance(transfer))) throw new Error('Insufficient funds');

  const { from, to, value, fee, timestamp } = transfer;
  const tc = await GetContract();
  const gasAmount = await tc.estimate.certifiedTransfer(from, to, value, fee, timestamp, transfer.signature);
  console.log(`Tx ${from} -> ${to}: Gas Amount ${gasAmount.toString()}`);
  const tx: TransactionResponse = await tc.certifiedTransfer(from, to, value, fee, timestamp, transfer.signature);

  console.assert(tx.hash, 'ERROR: Tx Hash returned null', JSON.stringify(tx));
  console.log(`TxHash: ${tx.hash}`);
  return tx;
}

// function isTx(tx:  CertifiedTransferResponse | TransactionResponse): tx is TransactionResponse {
// 	return (<TransactionResponse>tx).hash !== undefined;
// }
// async function DoCertifiedTransfer(transfer: CertifiedTransferRequest) {
// 	const res = await DoCertifiedTransferWaitable(transfer);
// 	return res;
// }

export { success, failure, DoCertifiedTransferWaitable };
