import { getContract, signGasslessUpdate, signMessage, splitIpfsUri } from '@thecointech/nft-contract';
import { Signer } from 'ethers';
import { GetNftApi } from '../../../api';

export async function uploadAvatar(image: Blob, signer: Signer) {
  const asTxt = await image.text();
  const sig = await signMessage(asTxt, signer);
  const r = await GetNftApi().uploadAvatar(image, sig);
  return r.data;
}

export async function uploadMetadata(tokenId: number, imageUri: string, signer: Signer) {
  const metadata = {
    name: `TC-NFT #${tokenId}`,
    description: "TheCoin Certified CO2-Neutral",
    image: imageUri,
    hash: "TODO",
  }
  const signature = await signMessage(imageUri, signer);
  const r = await GetNftApi().uploadMetadata(metadata, signature);
  return r.data;
}

export async function updateNft(tokenId: number, metadataUri: string, signer: Signer) {
  const split = splitIpfsUri(metadataUri);
  const nft = getContract();
  const lastUpdate = await nft.lastUpdate(tokenId);
  const gasslessUpdate = await signGasslessUpdate(signer, tokenId, lastUpdate, split.prefix, split.digest);
  const r = await GetNftApi().updateNftUri(gasslessUpdate);
  return r.status == 200;
}
