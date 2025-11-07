import React from 'react';
import { TestInfo } from '../../testInfo';
import { Button, Icon, Label } from 'semantic-ui-react';
import styles from './TestViewer.module.less';
import { useHistory } from 'react-router';

interface TestHeaderProps {
  test: TestInfo;
}

export const TestHeader: React.FC<TestHeaderProps> = ({ test }) => {
  const history = useHistory();

  const onClose = () => {
    history.push('/');
  };

  return (
    <div className={styles.header}>
      <div>
        <h2 style={{ margin: 0 }}>
          {test.key} / {test.element}
        </h2>
        {test.isFailing && (
          <Label color="red" style={{ marginLeft: '1rem' }}>
            Failing
          </Label>
        )}
      </div>
      <Button icon onClick={onClose} inverted>
        <Icon name="close" /> Close
      </Button>
    </div>
  );
};
