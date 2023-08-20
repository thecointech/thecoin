import { useState } from 'react';
import { ActionDataTypes, AnyActionData, AnyTxAction, TxActionType, storeTransition } from '@thecointech/broker-db';
import { Button, Select } from 'semantic-ui-react';
import { log } from '@thecointech/logging';
import { manualOverrideTransition } from '@thecointech/tx-statemachine/transitions';
import { graph as sellgraph } from '@thecointech/tx-etransfer';
import { graph as billgraph, uberGraph } from '@thecointech/tx-bill';
import { graph as plugingraph } from '@thecointech/tx-plugins';
// import { graph as plugingraph } from '@thecointech/tx-plugins';
import { etransfer as etransfergraph, manual as manualgraph } from '@thecointech/tx-deposit';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';

export const ManualOverride = (props: AnyTxAction) => {
  const [newState, setNewState] = useState<MaybeString>()
  return (
    <div>
      <Select
        placeholder='Manual Override'
        options={buildOptions(props.type, props.data)}
        onChange={(_, data) => setNewState(data.value?.toString())}
      />
      <Button disabled={!newState} onClick={() => overrideCurrentState(props, newState)}>
        Update
      </Button>
    </div>
  )
}

function buildOptions(type: TxActionType, data: AnyActionData) {
  // What states can we go to?
  // We may need to consider a cleaner view than the raw to-any-state
  const stategraph = getStateGraph(type, data);
  return Object
    .keys(stategraph)
    .map(state => ({ key: state, value: state, text: state }))
}

function getStateGraph(type: TxActionType, data: AnyActionData) {
  switch(type) {
    case "Sell": return sellgraph;
    case "Bill": {
      if (isCertTransfer(data.initial as any)) {
        return billgraph;
      }
      else {
        return uberGraph;
      }
    }
    case "Plugin": return plugingraph;
    // case "Plugin": return plugingraph;
    case "Buy": return (data as ActionDataTypes["Buy"]).initial.type ==  "etransfer"
      ? etransfergraph
      : manualgraph;
  }
}

function overrideCurrentState(action: AnyTxAction, newState: MaybeString) {
  if (!newState) {
    alert("Select a state");
    return;
  }
  const delta = manualOverrideTransition(newState);

  log.info({ transition: delta.type, state: newState, initialId: action.data.initialId },
    `Manually adding transition {transition} to state {state} for {initialId}`);
  storeTransition(action.doc, delta)
}

