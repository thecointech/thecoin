import { Button, Container, Loader, Dimmer } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer'
import { useHistory } from 'react-router';
import { useState } from 'react';

export const Complete = () => {
  const navigate = useHistory();
  const data = ConfigReducer.useData();
  const [dimmerMessage, setDimmerMessage] = useState<string | null>(null);

  const withDimmer = async <T,>(message: string, callback: () => Promise<T>): Promise<T> => {
    setDimmerMessage(message);
    try {
      return await callback();
    } finally {
      setDimmerMessage(null);
    }
  };

  const setConfig = async () => {
    await withDimmer("Saving...", async () => {
      await window.scraper.setHarvestConfig(data);
      navigate.push("/results");
    });
  }

  const paused = !!dimmerMessage;

  return (
    <Container>
      <Dimmer active={paused} inverted>
        <Loader>{dimmerMessage}</Loader>
      </Dimmer>
      <h4>Start the Harvester</h4>
      <div>
        Thats it!  Your harvester is ready to go!
      </div>
      <div>
        If you're happy with your setup, hit the great big green button.  This saves your results and schedules the harvester to run for you.
      </div>
      <div>
        Now... simply forget about it. The harvester will run for you, slowly
        scalping a few dollars and cents here and there as you go about your regular life.
      </div>
      <div>
        You can come back in and check it's progress whenever you want, but there won't be
        much to see for a while.  You'll be getting richer slowly though, and in a few years
        you'll be amazed by the results.
      </div>
      <div>
        <Button onClick={setConfig} loading={paused} disabled={paused} style={{backgroundColor: 'green', color: 'white'}}>Save Config</Button>
      </div>
    </Container>
  )
}
