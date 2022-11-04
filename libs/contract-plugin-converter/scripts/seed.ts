import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import { getSigner } from '@thecointech/signers';
import { ConnectContract, ALL_PERMISSIONS } from '@thecointech/contract-core';
import { getContract } from '@thecointech/contract-plugin-converter';

// Assume devlive
if (process.env.CONFIG_NAME !== "devlive") throw new Error("Not Sufficiently Tested");

async function main() {
  const client1 = await getSigner("client1");
  const theCoin = await getSigner("TheCoin");
  const tcCore = await ConnectContract(theCoin);
  const client1Address = await client1.getAddress();

  const converter = await getContract();
  await tcCore.pl_assignPlugin(client1Address, converter, ALL_PERMISSIONS, "0x1234");
}
