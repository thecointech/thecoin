import React, { useEffect } from 'react';
import { Tab } from 'semantic-ui-react';
import { Props } from './types';
import { Basic } from './Basic';
import { Advanced } from './Advanced';
import styles from './styles.module.less';
import { createParams } from '../simulator';
import { isEqual } from 'lodash';

const {initialBalance, ...defaultBasic} = createParams();

export const Form = (props: Props) => {

  const [active, setActive] = React.useState(0);
  const panes = [
    { menuItem: 'Basic', render: () => <Basic {...props} /> },
    { menuItem: 'Advanced', render: () => <Advanced {...props} /> },
  ]

  // If there are any non-default values, switch to advanced
  useEffect(() => {
    const { initialBalance, ...proprest} = props.params;
    if (!isEqual(proprest, defaultBasic))
      setActive(1);
  }, [])

  return <Tab
    className={styles.container}
    panes={panes}
    activeIndex={active}
    onTabChange={(_e, { activeIndex }) => setActive(activeIndex as number)} />;
};
