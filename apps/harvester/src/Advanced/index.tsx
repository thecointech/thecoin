import { useState } from 'react'
import { Dimmer, Header, Loader, Segment, SegmentGroup } from 'semantic-ui-react'
import { ExportResults } from './exportResults';
import { LoggingOptions } from './loggingOptions';
import { DimmerCallback } from './types';
import { BrowserControls } from './BrowserControls';
import styles from './index.module.less';

export const Advanced = () => {

  const [dimmerMessage, setDimmerMessage] = useState<string | null>(null);

  const withDimmer: DimmerCallback = async (message, callback) => {
    setDimmerMessage(message);
    try {
      await callback();
    } finally {
      setDimmerMessage(null);
    }
  };

  const paused = !!dimmerMessage;

  return (
    <SegmentGroup compact className={styles.container}>
      <Dimmer active={paused}>
        <Loader>{dimmerMessage}</Loader>
      </Dimmer>
      <Segment>
        <Header size="small">Browser Controls</Header>
        <BrowserControls withDimmer={withDimmer} paused={paused}/>
      </Segment>
      <Segment>
        <Header size="small">Logging</Header>
        <LoggingOptions withDimmer={withDimmer} paused={paused}/>
      </Segment>
      <Segment>
        <Header size="small">Import/Export Harvester data</Header>
        <ExportResults />
      </Segment>
    </SegmentGroup>
  )
}
