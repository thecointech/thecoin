import { getContract, getMinterAddress } from './contract';
import { getTokenClaimAuthority, getTokenClaimSig, TheGreenNFT } from '@thecointech/contract-nft';
import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { log } from '@thecointech/logging';

export type NftClaim = {
  tokenId: number,
  code: string,
  claimant: string,
}

//
// Claim (assign to) a token by claimant.
export async function claimNft({tokenId, code, claimant}: NftClaim) {
  log.trace({address: claimant, tokenId}, `Token {tokenId} is being claimed by {address}`);
  const nft = await getContract();
  const minter = await getMinterAddress();
  return (
    isValidClaimant(claimant) &&
    await isValidCode(tokenId, code, minter) &&
    await isValidToken(tokenId, nft, minter) &&
    await doClaimToken(tokenId, nft, code, claimant)
  )
}

//
// Check that destination is legitimate address
function isValidClaimant(claimant: string) {
  // Check that
  if (!IsValidAddress(claimant)) {
    log.warn({ address: claimant }, `Rejected claim because destination is not valid: {address}`);
    return false;
  }
  return true;
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
async function isValidToken(tokenId: number, nft: TheGreenNFT, minter: string) {
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
async function doClaimToken(tokenId: number, nft: TheGreenNFT, code: string, claimant: string) {
  const signature = getTokenClaimSig(code);
  console.log("Claim Sig: " + signature);
  try {
 const r = await nft.claimToken(tokenId, claimant, signature);
    log.debug({address: claimant, tokenId, hash: r.hash}, `Token {tokenId} assigned in {hash} - gasPrice: ${r.gasPrice?.toString()}, limit: ${r.gasLimit.toString()}`);
    console.log(`Token ${tokenId} assigned in ${r.hash} - gasPrice: ${r.gasPrice?.toString()}, limit: ${r.gasLimit.toString()}`);
    return r.hash ?? false;
  }
  catch(err: any) {
    log.error(err, "Claim Failed");
    console.error(err);
  }
  return false;
}
