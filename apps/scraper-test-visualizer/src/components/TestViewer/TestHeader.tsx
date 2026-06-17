import React from 'react';
import { TestInfo } from '../../testInfo';
import { Button, Icon, Label } from 'semantic-ui-react';
import styles from './TestViewer.module.less';
import { useNavigate } from 'react-router';
import { useFilteredTests } from '../../state/reducer';

interface TestHeaderProps {
  test: TestInfo;
}

function navigateToTest(navigate: ReturnType<typeof useNavigate>, test: TestInfo) {
  navigate(`/test/${encodeURIComponent(test.key)}/${encodeURIComponent(test.element)}`);
}

export const TestHeader: React.FC<TestHeaderProps> = ({ test }) => {
  const navigate = useNavigate();
  const filteredTests = useFilteredTests();

  const onClose = () => {
    navigate('/');
  };

  // Find current test in the filtered list
  const currentIndex = filteredTests.findIndex(
    t => t.key === test.key && t.element === test.element
  );

  // If the test is still in the list, prev/next are relative to it.
  // If it was fixed and dropped from the list (e.g. no longer failing),
  // treat it as if we're at the position it would have occupied,
  // so "next" goes to the test that now sits at that index (not index+1).
  const isInList = currentIndex >= 0;

  const hasPrev = isInList ? currentIndex > 0 : filteredTests.length > 0;
  const hasNext = isInList
    ? currentIndex < filteredTests.length - 1
    : filteredTests.length > 0;

  // lastViewedIndex is used when the current test dropped out of the list.
  // We store it so "next" picks up at the same position rather than skipping.
  const lastViewedIndex = React.useRef(0);
  if (isInList) {
    lastViewedIndex.current = currentIndex;
  }

  const onPrev = () => {
    if (!filteredTests.length) return;
    if (isInList) {
      navigateToTest(navigate, filteredTests[currentIndex - 1]);
    } else {
      // Go to the item just before where we were
      const idx = Math.min(lastViewedIndex.current, filteredTests.length) - 1;
      if (idx >= 0) navigateToTest(navigate, filteredTests[idx]);
    }
  };

  const onNext = () => {
    if (!filteredTests.length) return;
    if (isInList) {
      navigateToTest(navigate, filteredTests[currentIndex + 1]);
    } else {
      // The current test dropped out, so the item that slid into its position
      // is the natural "next" — use the same index, clamped.
      const idx = Math.min(lastViewedIndex.current, filteredTests.length - 1);
      navigateToTest(navigate, filteredTests[idx]);
    }
  };

  return (
    <div className={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button.Group size="small">
          <Button icon disabled={!hasPrev} onClick={onPrev}>
            <Icon name="chevron left" />
          </Button>
          <Button icon disabled={!hasNext} onClick={onNext}>
            <Icon name="chevron right" />
          </Button>
        </Button.Group>
        <h2 style={{ margin: 0 }}>
          {test.key} / {test.element}
        </h2>
        {test.isFailing && (
          <Label color="red" style={{ marginLeft: '0.5rem' }}>
            Failing
          </Label>
        )}
      </div>
      <Button icon onClick={onClose}>
        <Icon name="close" /> Close
      </Button>
    </div>
  );
};
