import { writeFileSync } from 'fs';
import { MigrationStep } from './step';
import { getSigner } from '@thecointech/signers';
import { getTokenClaimCode } from '../src/tokenCodes';
import { join } from 'path';
import { getContract } from './deploy';

const step: MigrationStep = () =>
  async (deployer, network, _accounts) => {
    if (network === 'devlive' || network === 'prodtest') {
      const minter = await getSigner("NFTMinter");
      const minterAddress = await minter.getAddress();
      const nft = await getContract(deployer, network);
      // Mint 10 NFT's from 10-20 and print out a claim code for each
      const ids = [0];
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++)
          ids.push(j + Math.pow(10, i))
      }
      await nft.bulkMinting(ids, 2022, { from: minterAddress });

      // Direct transfer #10 to Client1
      if (network === 'devlive') {
        const client1 = await getSigner("client1");
        nft.transferFrom(minterAddress, await client1.getAddress(), 10, { from: minterAddress });
      }

      // Now build 9 codes to be used.
      const codes = await Promise.all(ids.map(id => getTokenClaimCode(id, minter)));
      // now, write these out into an appropriate file
      const asJson = codes.reduce((obj, val, idx) => { obj[ids[idx]] = val; return obj }, {} as any);

      const tokenFile = join(__dirname, `../${network}.tokens.json`);
      writeFileSync(tokenFile, JSON.stringify(asJson));
    }
  }

module.exports = step
