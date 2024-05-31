import { useEffect, useState } from 'react'
import { Button, Checkbox, Dimmer, Loader, Segment } from 'semantic-ui-react'
import { HarvestData } from '../Harvester/types';
import { fromDb } from '../Harvester/db_translate';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { Result } from '../scraper_actions';

export const Results = () => {

  const [running, setRunning] = useState(false);
  const [state, setState] = useState<HarvestData|undefined>();
  const [visible, setVisible] = useState<boolean>();

  useEffect(() => {
    log.info("Loading state");
    getCurrentState().then(state => {
      if (state.error) {
        alert(state.error);
      }
      else {
        // log.info("State Received: " + JSON.stringify(state));
        setState(state.value);
      }
    })
  }, [])
  const runImmediately = async () => {
    setRunning(true);
    log.info("Commencing manual run");
    const r = await window.scraper.runHarvester(!visible);
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
    const state = await getCurrentState();
    log.info("Updating state");
    setState(state.value);
    setRunning(false);
  }

  const exportResults = async () => {
    const r = await window.scraper.exportResults();
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([r.value ?? 'no values'], { type: 'text/csv' }));
    a.download = 'results.csv';

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
    window.URL.revokeObjectURL(a.href);
  }

  const exportConfig = async () => {
    const r = await window.scraper.exportConfig();
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([r.value ?? 'no values'], { type: 'text/csv' }));
    a.download = 'config.json';

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
    window.URL.revokeObjectURL(a.href);
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
        <Button onClick={exportResults}>Export Results</Button>
      </div>
      <div>
        <Button onClick={exportConfig}>Export Config</Button>
      </div>
      <div>
        <Button onClick={runImmediately}>Run Harvester Now</Button>
        <Checkbox onClick={(_, {checked}) => setVisible(checked)} checked={visible} label="Visible" />
      </div>
    </Dimmer.Dimmable>

  )
}


const getCurrentState = async () : Promise<Result<HarvestData>> => {
  var r = await window.scraper.getCurrentState();
  if (r.value) {
    const converted: HarvestData = fromDb(r.value);
    return {
      value: converted,
    }
  }
  return {
    error: r.error,
  };
}
