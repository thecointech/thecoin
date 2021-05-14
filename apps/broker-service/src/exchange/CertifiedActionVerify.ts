
import { CertifiedTransfer, CertifiedTransferRequest } from '@thecointech/types';
import { NormalizeAddress } from '@thecointech/utilities';
import { getSigner } from '@thecointech/utilities/VerifiedAction'
import { GetTransferSigner } from '@thecointech/utilities/VerifiedTransfer'
import { ValidateError } from '@tsoa/runtime';
import { getBrokerCADAddress } from '../status';
import { certifiedFee } from '../status/constant.json';
import { GetContract } from './Wallet';

// Should we check balance?
const validBalance = async (transfer: CertifiedTransferRequest) => {
  const contract = await GetContract();
  const userBalance = await contract.balanceOf(transfer.from);
  return userBalance.toNumber() >= (transfer.fee + transfer.value);
}

const validDestination = (action: CertifiedTransfer, brokerCAD: string) => NormalizeAddress(action.transfer.to) === NormalizeAddress(brokerCAD);
const validFee = (transfer: CertifiedTransferRequest) => transfer.fee === certifiedFee;
const validTransferSigners = (transfer: CertifiedTransferRequest) => NormalizeAddress(GetTransferSigner(transfer)) === NormalizeAddress(transfer.from);
const validActionSigners = (action: CertifiedTransfer) => NormalizeAddress(getSigner(action)) === NormalizeAddress(action.transfer.from);


export async function validateTransfer(request: CertifiedTransferRequest) {
  if (!validFee(request))
    throw new ValidateError({fee: {message: "Invalid fee"}}, "Transfer validation failed");
  if (!await validBalance(request))
    throw new ValidateError({value: {message: "Insufficient Balance"}}, "Transfer validation failed");
  if (!validTransferSigners(request))
    throw new ValidateError({signature: {message: "Signature does not match"}}, "Transfer validation failed");
  return true
}

export async function validateAction(action: CertifiedTransfer) {
  // verify that the transfer recipient is the Broker CAD
  const brokerCAD = await getBrokerCADAddress();
  if (!validDestination(action, brokerCAD))
    throw new ValidateError({to: {message: "Invalid destination address"}}, "Action validation failed");
  if (!validActionSigners(action))
    throw new ValidateError({signature: {message: "Mismatched Signatures"}}, "Action validation failed");

  return validateTransfer(action.transfer);
}
