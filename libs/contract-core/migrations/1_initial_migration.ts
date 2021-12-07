import { MigrationStep } from './step';
import "../../../tools/setenv";
import { storeContractAddress } from '@thecointech/contract-tools/migrations';
import { deployProxy } from '@openzeppelin/truffle-upgrades';
import { getSigner } from '@thecointech/signers';

const step: MigrationStep =  (artifacts) =>
  async (deployer, network) => {
    const name = getName(network);
    const contract = artifacts.require(name);

    const contractArgs = await getArguments(network)
    //@ts-ignore
    const proxy = await deployProxy(contract, contractArgs, { deployer });
    // Serialize our contract addresses
    storeContractAddress(__dirname, network, proxy.address, ['cjs', 'mjs']);
  }

const getName = (network: string) =>
  network === 'polygon'
  ? "TheCoinL2" as "TheCoin"
  : "TheCoinL1" as "TheCoin";

// In some environments the address must be set
// statically (to support multiple hardware wallets)
// whereas in devlive the address is dynamically generated
const getTheCoinAddress = async () => (
  process.env.WALLET_TheCoin_ADDRESS ??
  (await getSigner("TheCoin")).getAddress()
)

async function getArguments(network: String) {
  return [
    await getTheCoinAddress(),
    network === 'polygon'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? process.env.POLYGON_CHILDCHAIN_MANAGER
      : process.env.POLYGON_ROOTNET_PREDICATE
  ]
}


module.exports = step
