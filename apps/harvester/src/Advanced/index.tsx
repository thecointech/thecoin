import { useState } from 'react'
import { Dimmer, Header, Loader, Segment, SegmentGroup } from 'semantic-ui-react'
import { ExportResults } from './ExportResults';
import { LoggingOptions } from './LoggingOptions';
import { DimmerCallback } from './types';
import { BrowserControls } from './BrowserControls';
import styles from './index.module.less';
import { ExportConfig } from './ExportConfig';
import { OverrideHarvesterState } from './OverrideHarvesterState';


export const Advanced = () => {

  const [dimmerMessage, setDimmerMessage] = useState({message: "", count: 0});

  const withDimmer: DimmerCallback = async (message, callback) => {
    setDimmerMessage((prev) => ({
      message,
      count: prev.count + 1,
    }));
    try {
      await callback();
    } finally {
      setDimmerMessage((prev) => ({
        message: prev.message,
        count: prev.count - 1,
      }));
    }
  };

  const paused = !!dimmerMessage?.count;

  return (
    <SegmentGroup compact className={styles.container}>
      <Dimmer active={paused}>
        <Loader>{dimmerMessage.message}</Loader>
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
        <Header size="small">Export Harvester data</Header>
        <ExportResults />
      </Segment>
      <Segment>
        <Header size="small">Import/Export Harvester config</Header>
        <ExportConfig  withDimmer={withDimmer} />
      </Segment>
      <Segment>
        <Header size="small">Override Harvester balance</Header>
        <OverrideHarvesterState  withDimmer={withDimmer} />
      </Segment>
    </SegmentGroup>
  )
}
