import React from 'react';
import type { TestSnapshot } from '../../types';
import { ElementData } from './ElementData';

interface SnapshotsProps {
  snapshot?: TestSnapshot;
}

export const Snapshots: React.FC<SnapshotsProps> = ({ snapshot }) => {
  if (!snapshot) return null;
  return (
    <ElementData element={snapshot.result.found} title={`Snapshot Result`} />
  );
};
