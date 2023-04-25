import { getIncompleteActions } from '@thecointech/broker-db';
import type { TheCoin } from '@thecointech/contract-core';
import { log } from '@thecointech/logging';
import { Processor } from '@thecointech/tx-plugins';
import { TypedActionContainer } from '@thecointech/tx-statemachine';

// Process all add/remove plugin requests
export async function processPlugin(tcCore: TheCoin) {

  let incomplete = await getIncompleteActions("Plugin");
  const processor = Processor(tcCore);

  const r: TypedActionContainer<"Plugin">[] = []
  for (const action of incomplete) {
    log.info(`Processing ${action.type} for ${action.address}`);
    const executed = await processor.execute(null, action);
    r.push(executed);
  }
  return r;
}


  // // get newly verified accounts
  // let incomplete = await getIncompleteActions("Plugin");
  // log.info(`Got ${incomplete.length} incomplete actions`);
  // for (const action of incomplete) {
  //   // TODO: For completeness, this should probably be in a graph
  //   // However, the tx is gated due to lastTxTime, so it
  //   // wont be double-processed.
  //   const request = action.data.initial;
  //   if (isAssign(request)) {
  //     log.trace(`Assigning ${request.plugin} to ${request.user}`);
  //     const tx = await assignPlugin(tcCore, request);
  //     storeTransition(action.doc, { meta: tx.hash });

  //   }
  //   else {
  //     await removePlugin(tcCore, request);
  //   }
  //   await removeIncomplete(action.type, action.doc);
  // }

  // log.trace(`Plugin processing complete`);
