import { writeFileSync } from 'fs';
import { MigrationStep } from './step';
import { getSigner } from '@thecointech/accounts';
import { getTokenClaimCode } from '../src/tokenCodes';
import { join } from 'path';

const step: MigrationStep = (artifacts) =>
  async (_, network, _accounts) => {
    if (network === 'devlive') {
      const minter = await getSigner("NFTMinter");
      const minterAddress = await minter.getAddress();
      const contract = artifacts.require("TheCoinNFT");
      const nft = await contract.deployed();
      // Mint 10 NFT's from 10-20 and print out a claim code for each
      const ids = Array.from({length: 10}, (_, i) => i + 10)
      await nft.bulkMinting(ids, 2022, {from: minterAddress});

      // Transfer #10 to Client1
      const client1 = await getSigner("client1");
      nft.transferFrom(minterAddress, await client1.getAddress(), 10, {from: minterAddress});

      // Now build 9 codes to be used.
      const codes = await Promise.all(ids.slice(1).map(id => getTokenClaimCode(id, minter)));
      // now, write these out into an appropriate file
      const asJson = codes.reduce((obj, val, idx) => { obj[idx + 11] = val; return obj } , {} as any);

      const tokenFile = join(__dirname, '../devlive.tokens.json');
      writeFileSync(tokenFile, JSON.stringify(asJson));
    }
  }

module.exports = step
