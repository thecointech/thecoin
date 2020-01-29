
import { CertifiedTransfer } from '@the-coin/types'
import { NormalizeAddress } from '@the-coin/utilities';
import { GetSigner } from '@the-coin/utilities/VerifiedAction'
import { GetTransferSigner } from '@the-coin/utilities/VerifiedTransfer'
import status from './status.json';

const ValidSignatures = (action: CertifiedTransfer) => {
  const actionSigner = GetSigner(action);
  if (!actionSigner)
    return false;
  const xferSigner = GetTransferSigner(action.transfer);
  if (!xferSigner)
    return false;
  
  const signer = NormalizeAddress(action.transfer.from);
  return signer === NormalizeAddress(actionSigner) && 
         signer === NormalizeAddress(xferSigner);
}

const ValidDestination = (action: CertifiedTransfer) => 
  NormalizeAddress(action.transfer.to) == NormalizeAddress(status.address);

export const CertifiedActionVerify = async (action: CertifiedTransfer) => {
	// First, check that bill payment & the transfer are signed by the same person
	if (!ValidSignatures(action))
		throw new Error("Mismatching Signatures");

	// verify that the transfer recipient is the Broker CAD
	if (!ValidDestination(action))
    throw new Error("Invalid Destination");
    
  return true;
}