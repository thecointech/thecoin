import { log } from '@thecointech/logging';
import { getContract, signGasslessUpdate, signMessage, splitIpfsUri } from '@thecointech/nft-contract';
import { Signer } from 'ethers';
import { GetNftApi } from '../../../api';

export async function uploadAvatar(image: Blob, signer: Signer) {
  log.trace('Uploading avatar');
  const contents = new Uint8Array(await image.arrayBuffer());
  const sig = await signMessage(contents, signer);
  const r = await GetNftApi().uploadAvatar(image, sig);
  log.trace(`Uploaded to ${r.data}`);
  return r.data;
}

export async function uploadMetadata(tokenId: number, imageUri: string, signer: Signer) {
  log.trace('Uploading metadata');
  const metadata = {
    name: `TC-NFT #${tokenId}`,
    description: "TheCoin Certified CO2-Neutral",
    image: imageUri,
    hash: "TODO",
  }
  const signature = await signMessage(imageUri, signer);
  const r = await GetNftApi().uploadMetadata(metadata, signature);
  log.trace(`Uploaded to ${r.data}`);
  return r.data;
}

export async function updateNft(tokenId: number, metadataUri: string, signer: Signer) {
  log.trace(`Updating NFT`);
  const split = splitIpfsUri(metadataUri);
  const nft = getContract();
  const lastUpdate = await nft.lastUpdate(tokenId);
  const gasslessUpdate = await signGasslessUpdate(signer, tokenId, lastUpdate, split.prefix, split.digest);
  const r = await GetNftApi().updateNftUri(gasslessUpdate);
  log.trace(`NFT Updated`);
  return r.status == 200;
}
