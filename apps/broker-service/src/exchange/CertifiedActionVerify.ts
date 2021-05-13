
import { CertifiedTransfer } from '@thecointech/types';
import { NormalizeAddress } from '@thecointech/utilities';
import { GetSigner } from '@thecointech/utilities/VerifiedAction'
import { GetTransferSigner } from '@thecointech/utilities/VerifiedTransfer'
import { getBrokerCADAddress } from '../status';

const ValidSignatures = (action: CertifiedTransfer, actionSigner: string) => {

  const xferSigner = GetTransferSigner(action.transfer);
  if (!xferSigner)
    return false;

  const signer = NormalizeAddress(action.transfer.from);
  return signer === NormalizeAddress(actionSigner) &&
         signer === NormalizeAddress(xferSigner);
}

const ValidDestination = (action: CertifiedTransfer, brokerCAD: string) =>
  NormalizeAddress(action.transfer.to) == NormalizeAddress(brokerCAD);

export const CertifiedActionVerify = async (action: CertifiedTransfer) => {
  // First, is the signature valid?
  const actionSigner = GetSigner(action);
  if (!actionSigner)
    throw new Error("Invalid signature");

	// Next, check that bill payment & the transfer are signed by the same person
	if (!ValidSignatures(action, actionSigner))
		throw new Error("Mismatching Signatures");

	// verify that the transfer recipient is the Broker CAD
  const brokerCAD = await getBrokerCADAddress();
	if (!ValidDestination(action, brokerCAD))
    throw new Error("Invalid Destination");

  return actionSigner;
}
