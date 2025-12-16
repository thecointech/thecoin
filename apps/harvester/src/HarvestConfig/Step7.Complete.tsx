import { Container, Loader, Dimmer, Header } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer'
import { useNavigate } from 'react-router';
import { useState } from 'react';
import styles from './Step7.module.less';
import { ActionButton } from '@/ContentSection/Action';

export const Complete = () => {
  const navigate = useNavigate();
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
    });
    navigate("/results");
  }

  const paused = !!dimmerMessage;

  return (
    <Container>
      <Dimmer active={paused} inverted>
        <Loader>{dimmerMessage}</Loader>
      </Dimmer>
      <Header size="small">Start the Harvester</Header>
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
      <ActionButton onClick={setConfig} loading={paused} disabled={paused} className={styles.saveButton}>Save Config</ActionButton>
    </Container>
  )
}
