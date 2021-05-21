import { log } from '@thecointech/logging';
import { verifyMessage } from 'ethers/utils';
import { getContract } from './contract';
import imageType from 'image-type';

export async function validateImage(buffer: Buffer, signature: string) {
  // First, lets check the signature of this upload
  const address = verifyMessage(buffer, signature);
  // Ensure we leave behind a trace of who-uploaded-who?
  log.debug({address}, `Validating upload from {address}`);

  // Validate our input: lets not put sketchy data online under our name
  return (
    await isOwned(address) &&
    await isValidImageType(buffer, address)
  );

}

async function isOwned(address: string) {
  const contract = await getContract();
  const owned = await contract.balanceOf(address);
  if (owned.isZero()) {
    log.warn({address}, `Rejected upload from {address} because no NFTs are owned`);
    return false;
  }
  return true;
}

async function isValidImageType(buffer: Buffer, address: string) {
  const res = imageType(buffer);
  if(res.mime !== 'image/png' && res.mime !== 'image/webp' && res.mime !== 'image/jpg') {
    log.warn({address}, `Rejected upload from {address} because an invalid type (${res.mime}) was detected`);
    return false;
  }
  return true;
}
