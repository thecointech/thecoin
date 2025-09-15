import { useEffect, useState } from 'react'
import { Button, Checkbox, Dimmer, Loader, Segment } from 'semantic-ui-react'
import { HarvestData } from '../Harvester/types';
import { fromDb } from '@thecointech/store-harvester';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { Result } from '../scraper_actions';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from '@/BackgroundTask/BackgroundTaskProgressBar';
import { useBackgroundTask, isRunning } from '@/BackgroundTask';

export const Results = () => {

  const [state, setState] = useState<HarvestData|undefined>();
  const [visible, setVisible] = useState<boolean>();
  const replayTask = useBackgroundTask("replay");
  const isReplaying = isRunning(replayTask);

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
    log.info("Commencing manual run");
    const r = await window.scraper.runHarvester(!visible);
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
    const state = await getCurrentState();
    log.info("Updating state");
    setState(state.value);
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

  const importConfig = async () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    // Handle file selection
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Read and parse the JSON file
        const text = await file.text();
        const config = JSON.parse(text);

        // Validate that we can get a scraping config
        // getScrapingScript(config);
        // Set the process config
        const r = await window.scraper.importScraperScript(config);
        if (r.error) {
          alert("Error - please check logs:\n " + r.error);
        }
        else {
          alert("Config imported successfully!");
        }
      } catch (err) {
        console.error('Failed to import config:', err);
        alert('Failed to import configuration file. Please ensure it is a valid JSON file with scraping settings.');
      }
    };

    // Trigger file selection
    input.click();
  }
  const paymentPending = state?.state.toPayVisa
    ? `${state.state.toPayVisa.format()} - ${state.state.toPayVisaDate?.toLocaleString(DateTime.DATETIME_SHORT)}`
    : 'N/A'

  async function launchBrowser() {
    const r = await window.scraper.warmup("_blank");
    if (r.error) {
      alert("Error - please check logs:\n " + r.error);
    }
  }

  return (
    <>
      <Dimmer.Dimmable as={Segment} dimmed={isReplaying}>
        <Dimmer active={isReplaying} inverted>
          <Loader>Running</Loader>
        </Dimmer>
        <div>
          <h1>Current State</h1>
          <p>Chq Balance: {state?.chq.balance.format() ?? 'N/A'}</p>
          <p>Visa Balance: {state?.visa.balance.format() ?? 'N/A'}</p>
          <p>Harvester Balance: {state?.state.harvesterBalance?.format() ?? 'N/A'}</p>
          <p>Visa Payment Pending: {paymentPending}</p>
          <p>Last Run: {state?.date.toLocaleString(DateTime.DATETIME_SHORT) ?? 'N/A'}</p>
        </div>
        <div>
          <Button onClick={launchBrowser}>Launch Browser</Button>
        </div>
        <div>
          <Button onClick={exportResults}>Export Results</Button>
        </div>
        <div>
          <Button onClick={exportConfig}>Export Config</Button>
        </div>
        <div>
          <Button onClick={importConfig}>Import Script</Button>
        </div>
        <div>
          <Button onClick={runImmediately}>Run Harvester Now</Button>
          <Checkbox onClick={(_, {checked}) => setVisible(checked)} checked={visible} label="Override Visibility" />
        </div>
      </Dimmer.Dimmable>
      <BackgroundTaskProgressBar type='replay' />
      <BackgroundTaskErrors type='replay' />
    </>
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
