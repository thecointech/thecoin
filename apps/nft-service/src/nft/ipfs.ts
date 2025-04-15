/// <reference types="../../types/pinata" />
// NOTE: Triple-slash directive above is necessary for compiling with ts-node:
// https://github.com/TypeStrong/ts-node#help-my-types-are-missing
import pinataSDK from '@pinata/sdk';
import { log } from '@thecointech/logging';
import { validateImage, validateJson } from './validate';
import type { MetadataJson } from '@thecointech/contract-nft';
import { Readable } from 'stream';
import { getSecret } from '@thecointech/secrets';

async function getPinataSDK() {
  const apiKey = await getSecret("PinataApiKey");
  const apiSecret = await getSecret("PinataApiSecret");
  return pinataSDK(apiKey, apiSecret);
}
//
// Upload buffer to IPFS, return upload hash
export async function upload(file: Buffer, filename: string) {
  log.trace(`Uploading ${file.byteLength} bytes`);
  const stream = Readable.from(file);

  // Fixes upload issue: https://github.com/PinataCloud/Pinata-SDK/issues/28
  // ¡¡ THE HACK !!
  (stream as any).path = filename;
  const pinata = await getPinataSDK();
  const r = await pinata.pinFileToIPFS(stream, {
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
  return upload(avatar, "avatar.jpg");
}

//
// Upload JSON metadata to IPFS, return hash
export async function uploadMetadata(metadata: MetadataJson, signature: string) {
  // First, validate the data is (probably) legit.
  if (!await validateJson(metadata, signature))
    return null;

  const metadataBuffer = Buffer.from(JSON.stringify(metadata));
  return upload(metadataBuffer, "metadata.json");
}
