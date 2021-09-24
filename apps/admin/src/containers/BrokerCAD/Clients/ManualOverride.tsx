import React, { useState } from 'react';
import { AnyAction } from 'redux';
import { ActionType, storeTransition } from '@thecointech/broker-db';
import { graph } from '@thecointech/tx-etransfer';
import { etransfer } from '@thecointech/tx-deposit';
import { Button, Select } from 'semantic-ui-react';
import { log } from '@thecointech/logging';
import { manualOverrideTransition } from '@thecointech/tx-statemachine/transitions';

export const ManualOverride = (props: AnyAction) => {
  const [newState, setNewState] = useState<MaybeString>()
  return (
    <div>
      <Select
        placeholder='Manual Override'
        options={buildOptions(props.type)}
        onChange={(_, data) => setNewState(data.value?.toString())}
      />
      <Button disabled={!newState} onClick={() => overrideCurrentState(props, newState)}>
        Update
      </Button>
    </div>
  )
}

function buildOptions(type: ActionType) {
  // What states can we go to?
  // We may need to consider a cleaner view than the raw to-any-state
  const states = type == "Buy" ? Object.keys(etransfer) : Object.keys(graph);
  return states.map(state => ({ key: state, value: state, text: state }))
}

function overrideCurrentState(action: AnyAction, newState: MaybeString) {
  if (!newState) {
    alert("Select a state");
    return;
  }
  const delta = manualOverrideTransition(newState);

  log.info({ transition: delta.type, state: newState, initialId: action.data.initialId },
    `Manually adding transition {transition} to state {state} for {initialId}`);
  storeTransition(action.doc, delta)
}

