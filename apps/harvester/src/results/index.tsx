import { useEffect, useState } from 'react'
import { Button, Dimmer, Loader, Segment } from 'semantic-ui-react'
import { HarvestData } from '../Harvester/types';
import { fromDb } from '../Harvester/db_translate';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';


export const Results = () => {

  const [running, setRunning] = useState(false);
  const [state, setState] = useState<HarvestData|undefined>();

  useEffect(() => {
    log.info("Loading state");
    getCurrentState().then(state => {
      if (state.error) {
        alert(state.error);
      }
      else {
        log.info("State Received: " + JSON.stringify(state));
        setState(state.value);
      }
    })
  }, [])
  const runImmediately = async () => {
    setRunning(true);
    log.info("Commencing manual run");
    const r = await window.scraper.runHarvester();
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
    const state = await getCurrentState();
    log.info("Updating state");
    setState(state.value);
    setRunning(false);
  }
  return (
    <Dimmer.Dimmable as={Segment} dimmed={running}>
      <Dimmer active={running} inverted>
        <Loader>Running</Loader>
      </Dimmer>
      <div>
        <h1>Current State</h1>
        <p>Chq Balance: {state?.chq.balance.format() ?? 'N/A'}</p>
        <p>Visa Balance: {state?.visa.balance.format() ?? 'N/A'}</p>
        <p>Harvester Balance: {state?.state.harvesterBalance?.format() ?? 'N/A'}</p>
        <p>Visa Payment Pending: {state?.state.toPayVisa?.format() ?? 'N/A'}</p>
        <p>Last Run: {state?.date.toLocaleString(DateTime.DATETIME_SHORT) ?? 'N/A'}</p>
      </div>
      <div>
        <Button onClick={runImmediately}>Manual Run</Button>
      </div>
    </Dimmer.Dimmable>

  )
}


const getCurrentState = async () => {
  var r = await window.scraper.getCurrentState();
  if (r.value) {
    const converted = fromDb(r.value);
    return {
      value: converted,
    }
  }
  return r;
}
