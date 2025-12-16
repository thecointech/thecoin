import { jest } from '@jest/globals';
import { describe } from '@thecointech/jestutils';
import { ifPolygonscan } from '@thecointech/secrets/jestutils';
import { getPluginLogs } from './logs';
import { getEnvVars } from '@thecointech/setenv';
import { getProvider } from '@thecointech/ethers-provider/Erc20Provider/web';

jest.setTimeout(30 * 1000);

describe('Live data fetches', () => {

  const oldVars = {...process.env};
  const prodVars = getEnvVars("prod");

  it ('fetches logs', async () => {
    process.env = {
      ...oldVars,
      ...prodVars,
    }
    const address = "0x70da7D05Ee936E583A5165c62A1DEd3Cb0A07C82"; // Converter-Prod
    const user = "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4";
    const initBlock = Number(prodVars.INITIAL_COIN_BLOCK);
    const provider = await getProvider();
    const afterFirstTx = 44767897 + 1;
    const after8thTx = 58296048;
    // verify toBlock is working
    const r = await getPluginLogs(address, user, provider, initBlock, after8thTx);
    expect(r.length).toEqual(8);

    // verify fromBlock is working (2 logs in the first tx)
    const r2 = await getPluginLogs(address, user, provider, afterFirstTx, after8thTx);
    expect(r2.length).toEqual(6);
  })
}, await ifPolygonscan("prod"));

// it ('fetches logs for ', async () => {
//   const {owner, contract} = await deployContract()
//   await setRoundPoint(contract, 50e2, DateTime.now());
//   const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
//   expect(logs.length).toBe(1);
//   expect(logs[0].amnt.toNumber()).toBe(50e2);
//   expect(logs[0].path).toBe("UserRounding[user]");
//   expect(logs[0].user).toBe(owner.address);
//   expect(logs[0].timestamp.diffNow("seconds").seconds).toBeGreaterThan(-5);
// })

// it ('updates state correctly', async () => {
//   const {owner, contract} = await deployContract()
//   await setRoundPoint(contract, 50e2);
//   const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
//   const state: any = {}
//   updateState(state, DateTime.now(), logs);
//   expect(state.UserRounding[owner.address].toNumber()).toEqual(50e2);
// })

// it ('applies logs correctly across time', async () => {
//   const {owner, contract} = await deployContract()
//   const points = [
//     50e2,
//     200e2,
//     150e2,
//   ];
//   for (let i = 0; i < points.length; i++) {
//     await setRoundPoint(contract, points[i], daysAgo(points.length - i));
//   }

//   const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
//   const state: any = {}

//   // Prior update changes nothing
//   updateState(state, daysAgo(points.length + 1), logs);
//   expect(state.UserRounding).toBeUndefined();

//   for (let i = 0; i < points.length; i++) {
//     updateState(state, daysAgo(points.length - i), logs);
//     expect(state.UserRounding[owner.address].toNumber()).toEqual(points[i]);
//   }
// })

// const daysAgo = (days: number) => DateTime.now().minus({days})

// async function deployContract() {
//   const [owner] = await hre.ethers.getSigners()
//   const oracle = await createAndInitOracle(owner);
//   const RoundNumber = await hre.ethers.getContractFactory('RoundNumber');
//   const contract = await RoundNumber.deploy(oracle.address);
//   return {owner, contract};
// }

// async function setRoundPoint(contract: RoundNumber, roundPoint: number, timestamp?: DateTime) {
//   // Change default roundPoint
//   const timestampSec = Math.round(
//     (timestamp ?? DateTime.now().minus({seconds: 30})).toSeconds()
//   )
//   const r = await contract.setRoundPoint(roundPoint, timestampSec);
//   await r.wait();
//}
