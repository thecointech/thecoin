import { log } from '@thecointech/logging';
import { getContract, signGasslessUpdate, splitIpfsUri } from '@thecointech/contract-nft';
import { Signer } from 'ethers';
import { GetNftApi } from '@thecointech/apis/nft';
import { sign } from "@thecointech/utilities/SignedMessages";

export async function uploadAvatar(image: Blob, signer: Signer) {
  log.trace('Uploading avatar');
  const contents = new Uint8Array(await image.arrayBuffer());
  const sig = await sign(contents, signer);
  alert("NOTE: This has never been tested!");
  debugger;
  // Our Windows build accepts 'any', but it seems the linux
  // build is now demanding this be of type 'File' instead
  const asfile = new File([image], sig);
  const r = await GetNftApi().uploadAvatar(asfile, sig);
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
    signature: await sign(imageUri, signer),
  }
  const r = await GetNftApi().uploadMetadata(metadata);
  log.trace(`Uploaded to ${r.data}`);
  return r.data;
}

export async function updateNft(tokenId: number, metadataUri: string, signer: Signer) {
  log.trace(`Updating NFT`);
  const split = splitIpfsUri(metadataUri);
  const nft = await getContract();
  const lastUpdate = await nft.lastUpdate(tokenId);
  const gasslessUpdate = await signGasslessUpdate(signer, tokenId, Number(lastUpdate), split.prefix, split.digest);
  const r = await GetNftApi().updateNftUri(gasslessUpdate);
  log.trace(`NFT Updated`);
  return r.data;
}
