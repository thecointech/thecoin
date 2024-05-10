import hre from 'hardhat';
import { getSigner } from '@thecointech/signers';
import { connectNFT } from '../src/connect';
import { getTokenClaimCode, getTokenClaimSig } from '../src/tokenCodes';
import { writeFileSync } from 'fs';
import { log } from '@thecointech/logging';

const network = "polygon"; //hre.network.name;
const config = process.env.CONFIG_NAME ?? "development";
const mintTestTokens = config === 'devlive' || (network == 'polygon' || config === 'prodtest');
if (!mintTestTokens)
  process.exit(0);

log.info("Minting test tokens");
const minter = await getSigner("NFTMinter");
const minterAddress = await minter.getAddress();
const nft = await connectNFT(minter);

// Mint 10 NFT's from 10-20 and print out a claim code for each
const ids = [0];
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++)
    ids.push(j + Math.pow(10, i))
}
await nft.bulkMinting(ids, 2022, { from: minterAddress });

// Now build 9 codes to be used.
const codes = await Promise.all(ids.map(id => getTokenClaimCode(id, minter)));

// now, write these out into an appropriate file
const asJson = codes.reduce((obj, val, idx) => { obj[ids[idx]] = val; return obj }, {} as any);

const tokenFile = new URL(`../${config}-${network}.tokens.json`, import.meta.url);
log.info(`Wrote token keys to : ${tokenFile}`);
writeFileSync(tokenFile, JSON.stringify(asJson));

// In devlive simulate a token claiming
if (config === 'devlive') {
  log.info("Transfering test token to client1");
  const client1 = await getSigner("client1");
  const claimSig = getTokenClaimSig(asJson[10]);
  const r = await nft.claimToken(10, client1, claimSig, { from: minterAddress });

  // Double check it succeeded
  const newOwner = await nft.ownerOf(10);
  log.info("Transferred: " + (newOwner === await client1.getAddress()))
}
