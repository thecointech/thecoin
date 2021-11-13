import { toNamedAccounts } from "./accounts";
import { initializeDevLive } from "./4.1_mad_devlive";
import { MigrationStep } from './step';
import { getContract } from './deploy';
import { Processor } from './warmup_contract/processor';

const deploy: MigrationStep = () =>
  async (deployer, network, accounts) => {
    const contract = await getContract(deployer, network);
    const namedAccounts = toNamedAccounts(accounts);
    console.log(`Distributing on ${network}`);
    if (network == "polygon") {
      // If we are asked to clone onto this contract try to do so.
      console.log("Initialization: " + process.env.DEPLOY_CONTRACT_INIT);
      if (process.env.DEPLOY_CONTRACT_INIT == "clone")
      {
        console.log("Cloning production...");
        const processor = new Processor();
        if (await processor.init()) {
          await processor.process();
          return;
        }
      }
      const config = process.env.CONFIG_NAME;
      if (config == "devlive" || config == "prodtest") {
        await initializeDevLive(contract, namedAccounts)
      }
    }
  }

module.exports = deploy;
