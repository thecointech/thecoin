import { toNamedAccounts } from "./accounts";
import { initializeDevLive } from "./3.1_mad_devlive";
import { MigrationStep } from './step';
import { getDeployed } from './deploy';
import { Processor } from './warmup_contract/processor';

const deploy: MigrationStep = (artifacts) =>
  async (_, network, accounts) => {
    const contract = await getDeployed(artifacts, network);
    const namedAccounts = toNamedAccounts(accounts);
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
