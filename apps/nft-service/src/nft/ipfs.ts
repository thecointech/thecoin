/// <reference types="../../types/pinata" />
// NOTE: Triple-slash directive above is necessary for compiling with ts-node:
// https://github.com/TypeStrong/ts-node#help-my-types-are-missing
import pinataSDK from '@pinata/sdk';
import { log } from '@thecointech/logging';
import { MetadataJson } from '@thecointech/nft-contract';
import { validateImage, validateJson } from './validate';

const pinata = pinataSDK(process.env.PINATA_API_KEY!, process.env.PINATA_API_SECRET!);

//
// Upload buffer to IPFS, return upload hash
export async function upload(file: Buffer) {
  log.trace(`Uploading ${file.byteLength} bytes for `)
  const r = await pinata.pinFileToIPFS(file, {
    pinataOptions: {
      cidVersion: 0
    }
  });
  log.trace({tokenUri: r.IpfsHash}, `Completed ${r.PinSize} bytes for {tokenUri}`);
  return r.IpfsHash
}

//
// Upload a supported image type to IPFS, return hash
export async function uploadAvatar(avatar: Buffer, signature: string) {
  // First, validate we are uploading something that is probably right.
  if (!await validateImage(avatar, signature))
    return null;
  return upload(avatar);
}

//
// Upload JSON metadata to IPFS, return hash
export async function uploadMetadata(metadata: MetadataJson, signature: string) {
  // First, validate the data is (probably) legit.
  if (!await validateJson(metadata, signature))
    return null;

  const metadataBuffer = Buffer.from(JSON.stringify(metadata));
  return upload(metadataBuffer);
}
