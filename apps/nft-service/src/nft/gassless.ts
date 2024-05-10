import { log } from '@thecointech/logging';
import { GasslessUpdateRequest, getGasslessSigner, TheGreenNFT } from '@thecointech/contract-nft';
import { getContract } from "./contract";

export async function gasslessUpdate(request: GasslessUpdateRequest): Promise<boolean> {

  const contract = await getContract();
  // First, lets verify the details (no point submitting a transaction that will never work)
  if (
    await isBadSignature(contract, request) ||
    await isTimeLocked(contract, request.tokenId) ||
    await isReplay(contract, request)
  ) {
    return false;
  }

  // All seems good
  log.debug({TokenID: request.tokenId}, "Submitting gassless update for {TokenID}");
  const r = await contract.updateMetaSha256GassLess(request.tokenId, request.prefix, request.digest, request.signature);
  log.debug({TokenID: request.tokenId, hash: r.hash}, "Gassless update for {TokenID} submitted at {hash}");
  return true;
}

const isBadSignature = async (contract: TheGreenNFT, request: GasslessUpdateRequest) => {
  const address = getGasslessSigner(request);
  const owner = await contract.ownerOf(request.tokenId);
  if (owner !== address) {
    log.warn({TokenID: request.tokenId}, `Invalid request to update {TokenID}: signature ${address} does not match owner`);
    return true;
  }
  return false;
}

const isTimeLocked = async (contract: TheGreenNFT, tokenId: number) => {
  const canUpdate = await contract.canUpdate(tokenId);
  if (!canUpdate) {
    log.warn({TokenID: tokenId}, `Invalid request to update {TokenID}: NFT is still timelocked`);
    return true;
  }
  return false;
}

const isReplay = async (contract: TheGreenNFT, request: GasslessUpdateRequest) => {
  const lastUpdate = await contract.lastUpdate(request.tokenId);
  if (Number(lastUpdate) != request.lastUpdate) {
    log.warn({TokenID: request.tokenId}, `Invalid request to update {TokenID}: lastUpdate (${request.lastUpdate}) does not match blockchain value`);
    return true;
  }
  return false
}
