import { getContract, getMinterAddress } from './contract';
import { getTokenClaimAuthority, getTokenClaimSig, TheCoinNFT } from '@thecointech/nft-contract';
import { NormalizeAddress } from "@thecointech/utilities";
import { log } from '@thecointech/logging';

export type NftClaim = {
  tokenId: number,
  code: string,
  claimant: string,
}

//
// Claim (assign to) a token by claimant.
export async function claimNft({tokenId, code, claimant}: NftClaim) {
  log.trace({address: claimant, tokenId}, `Token {tokenId} is being casdflaimed by {address}`);
  const nft = await getContract();
  const minter = await getMinterAddress();
  return (
    await isValidCode(tokenId, code, minter) &&
    await isValidToken(tokenId, nft, minter) &&
    await doClaimToken(tokenId, nft, code, claimant)
  )
}

//
// Check signing authority on that code
async function isValidCode(tokenId: number, code: string, minter: string) {
  // First, validate that this is (probably) a legal claim
  const signer = getTokenClaimAuthority(tokenId, code);
  if (NormalizeAddress(signer) !== NormalizeAddress(minter)) {
    log.warn({ signer }, `Rejected claim because it was signed by {address}`);
    return false;
  }
  return true;
}

//
// Check token in question can still be assigned.
async function isValidToken(tokenId: number, nft: TheCoinNFT, minter: string) {
  console.log("Checking ownership of " + tokenId);

  const owner = await nft.ownerOf(tokenId);
  if (NormalizeAddress(owner) !== NormalizeAddress(minter)) {
    log.warn({tokenId}, `Cannot claim {tokenId} because it is already owned`);
    return false;
  }
  return true;
}

//
// assign the token, return true
async function doClaimToken(tokenId: number, nft: TheCoinNFT, code: string, claimant: string) {
  const signature = getTokenClaimSig(code);
  console.log("Claim Sig: " + signature);
  const r = await nft.claimToken(tokenId, claimant, signature);
  log.trace({address: claimant, tokenId, hash: r.hash}, `Token {tokenId} assigned in {hash}`);
  return true;
}
