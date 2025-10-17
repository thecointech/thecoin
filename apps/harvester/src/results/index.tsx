import { useEffect, useState } from 'react'
import { Button, Dimmer, Loader } from 'semantic-ui-react'
import { HarvestData } from '../Harvester/types';
import { fromDb } from '@thecointech/store-harvester';
import { StateDisplay } from './StateDisplay';
import { log } from '@thecointech/logging';
import { Result } from '../scraper_actions';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from '@/BackgroundTask/BackgroundTaskProgressBar';
import { useBackgroundTask, isRunning } from '@/BackgroundTask';
import { ContentSection } from '@/ContentSection';
import styles from './index.module.less';

export const Results = () => {

  const [state, setState] = useState<HarvestData|undefined>();
  const replayTask = useBackgroundTask("replay");
  const isReplaying = isRunning(replayTask);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    log.info("Loading state");
    getCurrentState().then(state => {
      setLoading(false);
      if (state.error) {
        alert(state.error);
      }
      else {
        setState(state.value);
      }
    })
  }, [])
  const runImmediately = async () => {
    log.info("Commencing manual run");
    const r = await window.scraper.runHarvester();
    if (r.error || r.value === "error") {
      let message = "Error - please check logs";
      if (r.error) message += `: ${r.error}`;
      alert(message);
      return;
    }
    const state = await getCurrentState();
    log.info("Updating state");
    setState(state.value);
  }


  return (
    <ContentSection>
      <Dimmer.Dimmable dimmed={isReplaying || loading} className={styles.resultsContainer}>
        <Dimmer active={isReplaying || loading}>
          <Loader>Running</Loader>
        </Dimmer>
        <StateDisplay state={state} />
        <div>
          <Button onClick={runImmediately} disabled={isReplaying || loading}>
            Run Harvester Now
          </Button>
        </div>
      </Dimmer.Dimmable>
      <BackgroundTaskProgressBar type='replay' />
      <BackgroundTaskErrors type='replay' />
    </ContentSection>
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
