import { ProcessUnsettledDeposits } from "@the-coin/tx-processing";
import { init } from "@the-coin/logging";
import { InitContract } from "@the-coin/tx-processing/BrokerTransferAssistant";

import { RbcStore } from "@the-coin/rbcapi/store";
import { ConfigStore } from "@the-coin/store";
init("TxProcessing");
RbcStore.initialize();
ConfigStore.initialize();

async function Process() {
    const deposits = await ProcessUnsettledDeposits();
    expect(deposits).not.toBeUndefined();
  
    for (const deposit of deposits) {
      expect(deposit.isComplete).toBeTruthy();
    }

 }     

Process();