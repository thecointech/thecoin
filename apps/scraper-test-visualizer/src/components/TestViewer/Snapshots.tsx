import React, { useState } from 'react';
import { Message, Accordion, Icon, Label } from 'semantic-ui-react';
import type { TestSnapshot } from '../../types';
import type { Coords } from '@thecointech/scraper-types';
import { ElementData } from './ElementData';

interface SnapshotsProps {
  snapshots: TestSnapshot[];
  onSnapshotSelect?: (coords: Coords | null) => void;
}

export const Snapshots: React.FC<SnapshotsProps> = ({ snapshots, onSnapshotSelect }) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  if (snapshots.length === 0) {
    return <Message info>No snapshots available</Message>;
  }

  const handleAccordionClick = (index: number) => {
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);

    // Call the callback with the selected snapshot's coords (or null if closing)
    if (onSnapshotSelect) {
      if (newIndex === -1) {
        onSnapshotSelect(null);
      } else {
        const coords = snapshots[newIndex]?.result?.found?.data?.coords;
        onSnapshotSelect(coords || null);
      }
    }
  };

  return (
    <Accordion styled fluid>
      {snapshots.map((snapshot, index) => {
        const date = new Date(snapshot.time);
        return (
          <React.Fragment key={index}>
            <Accordion.Title
              active={activeIndex === index}
              index={index}
              onClick={() => handleAccordionClick(index)}
            >
              <Icon name="dropdown" />
              Snapshot {index + 1} - {date.toLocaleString()}
              {snapshot.result.found.score !== undefined && (
                <Label color={snapshot.result.found.score > 0.8 ? 'green' : 'yellow'} style={{ marginLeft: '1rem' }}>
                  Score: {snapshot.result.found.score.toFixed(3)}
                </Label>
              )}
            </Accordion.Title>
            <Accordion.Content active={activeIndex === index}>
              <ElementData element={snapshot.result.found} title={`Snapshot Result`} />
            </Accordion.Content>
          </React.Fragment>
        );
      })}
    </Accordion>
  );
};
