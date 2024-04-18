
import { CertifiedTransfer, CertifiedTransferRequest, UberTransferAction } from '@thecointech/types';
import { NormalizeAddress } from '@thecointech/utilities';
import { getSigner } from '@thecointech/utilities/VerifiedAction'
import { GetTransferSigner } from '@thecointech/utilities/VerifiedTransfer'
import { ValidateError } from '@tsoa/runtime';
import { getBrokerCADAddress } from '../status';
import constants from '../status/constant.json' assert { type: 'json' };
import { GetContract } from '../signer/Wallet';

type AnyAction = CertifiedTransfer | UberTransferAction;

// Should we check balance?
const validBalance = async (transfer: CertifiedTransferRequest) => {
  const contract = await GetContract();
  const userBalance = await contract.balanceOf(transfer.from);
  return userBalance.toNumber() >= (transfer.fee + transfer.value);
}

const validDestination = (action: AnyAction, brokerCAD: string) => NormalizeAddress(action.transfer.to) === NormalizeAddress(brokerCAD);
const validFee = (transfer: CertifiedTransferRequest) => transfer.fee === constants.certifiedFee;
const validTransferSigners = (transfer: CertifiedTransferRequest) => NormalizeAddress(GetTransferSigner(transfer)) === NormalizeAddress(transfer.from);
const validActionSigners = (action: AnyAction) => NormalizeAddress(getSigner(action)) === NormalizeAddress(action.transfer.from);

const throwError = <T>(src: T, key: keyof T, message: string) => { throw new ValidateError({[key]: {message, value: src[key]}}, "Transfer validation failed") }

export async function validateTransfer(request: CertifiedTransferRequest) {
  if (!validFee(request))
    throwError(request, "fee", "Invalid Fee");
  if (!await validBalance(request))
    throwError(request, "value", "Insufficient Balance");
  if (!validTransferSigners(request))
    throwError(request, "signature", "Signature does not match");
  return true
}

export async function validateAction(action: CertifiedTransfer) {
  // verify that the transfer recipient is the Broker CAD
  const brokerCAD = await getBrokerCADAddress();
  if (!validDestination(action, brokerCAD))
    throwError(action.transfer, "to", "Invalid destination address");
  if (!validActionSigners(action))
    throwError(action, "signature", "Mismatched Signatures");

  return validateTransfer(action.transfer);
}

export async function validateUberAction(action: UberTransferAction) {
  // verify that the transfer recipient is the Broker CAD
  const brokerCAD = await getBrokerCADAddress();
  if (!validDestination(action, brokerCAD))
    throwError(action.transfer, "to", "Invalid destination address");
  if (!validActionSigners(action))
    throwError(action, "signature", "Mismatched Signatures");

  // Skip most of the verification.
  // TODO: Normalize the treatment of CertifiedTransfer & UberTransfer
  // THIS IS A LOTTTTTA TECHNICAL DEBT!!!
  return true;
}
