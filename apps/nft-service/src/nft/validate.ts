import { log } from '@thecointech/logging';
import { getContract } from './contract';
import imageType from 'image-type';
import { MetadataJson } from '@thecointech/contract-nft';
import { verifyMessage } from 'ethers';

// Max JSON size: 4KB.  Should be OK, our default file is 400B
const MAX_JSON_LENGTH = 4086

export async function validateImage(buffer: Buffer, signature: string) {
  // First, lets check the signature of this upload
  const address = verifyMessage(buffer, signature);
  // Ensure we leave behind a trace of who-uploaded-what?
  log.debug({ address }, `Validating upload from {address}`);

  // Validate our input: lets not put sketchy data online under our name
  return (
    await isOwned(address) &&
    await isValidImageType(buffer, address)
  );
}

export async function validateJson(metadata: MetadataJson, signature: string) {
  // First, lets check the signature of this upload
  const address = verifyMessage(metadata.image, signature);
  log.debug({ address }, `Validating metadata from {address}`);
  // TODO: harden v unknown data in metadata, and/or
  return (
    await isOwned(address) &&
    await isValidJson(metadata, address)
  );
}

//
// Does the address own any tokens?
async function isOwned(address: string) {
  const contract = await getContract();
  const owned = await contract.balanceOf(address);
  if (owned == 0n) {
    log.warn({ address }, `Rejected upload from {address} because no NFTs are owned`);
    return false;
  }
  return true;
}

//
// Check the binary data is a supported image type.
async function isValidImageType(buffer: Buffer, address: string) {
  const res = await imageType(buffer);
  if (res?.mime !== 'image/png' && res?.mime !== 'image/webp' && res?.mime !== 'image/jpg' && res?.mime !== 'image/jpeg') {
    log.warn({ address }, `Rejected upload from {address} because an invalid type (${res?.mime}) was detected`);
    return false;
  }
  return true;
}

//
// Basic validation of the JSON data present
async function isValidJson(json: MetadataJson, address: string) {
  // Is this too big?
  if (JSON.stringify(json).length > MAX_JSON_LENGTH) {
    log.warn({ address }, `Rejected upload from {address} because an JSON payload is too big`);
    return false;
  }
  // TODO: This validates CIDv0 - We probably want to switch to CIDv1 for browser interop
  if (!json.image.match(/^ipfs:\/\/[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{46}$/)) {
    log.warn({ address }, `Rejected upload from {address} because the hash is not valid Base58`);
    return false;
  }
  return true; // json.hash.match(/^ipfs:\/\//)
}
