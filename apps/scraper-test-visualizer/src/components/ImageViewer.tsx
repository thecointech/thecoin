import React, { useState } from 'react';
import { Button, Icon, Dropdown } from 'semantic-ui-react';
import type { SelectedTest } from '../types';

interface ImageViewerProps {
  test: SelectedTest;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ test, onClose }) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  if (test.groups.length === 0) {
    return (
      <div className="image-viewer">
        <div className="image-viewer-header">
          <h2>{test.name}</h2>
          <Button icon onClick={onClose}>
            <Icon name="close" />
          </Button>
        </div>
        <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
          No test runs available for this test.
        </div>
      </div>
    );
  }

  const selectedGroup = test.groups[selectedGroupIndex];
  const groupDate = new Date(selectedGroup.timestamp).toLocaleString();

  const timestampOptions = test.groups.map((group, index) => ({
    key: index,
    text: new Date(group.timestamp).toLocaleString(),
    value: index,
  }));

  return (
    <div className="image-viewer">
      <div className="image-viewer-header">
        <div>
          <h2 style={{ margin: 0 }}>{test.name}</h2>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
            {groupDate}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {test.groups.length > 1 && (
            <Dropdown
              selection
              options={timestampOptions}
              value={selectedGroupIndex}
              onChange={(_, data) => setSelectedGroupIndex(data.value as number)}
              style={{ minWidth: '200px' }}
            />
          )}
          <Button icon onClick={onClose} inverted>
            <Icon name="close" /> Close
          </Button>
        </div>
      </div>

      <div className="image-viewer-content">
        {selectedGroup.files.blank && (
          <div className="image-column">
            <h4>Blank Page</h4>
            <img
              src={`/debugging/${test.name}/${selectedGroup.files.blank}`}
              alt="Blank page"
            />
          </div>
        )}

        {selectedGroup.files.found && (
          <div className="image-column">
            <h4>Found Element (Red)</h4>
            <img
              src={`/debugging/${test.name}/${selectedGroup.files.found}`}
              alt="Found element highlighted in red"
            />
          </div>
        )}

        {selectedGroup.files.original && (
          <div className="image-column">
            <h4>Expected Element (Blue)</h4>
            <img
              src={`/debugging/${test.name}/${selectedGroup.files.original}`}
              alt="Original/expected element highlighted in blue"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
