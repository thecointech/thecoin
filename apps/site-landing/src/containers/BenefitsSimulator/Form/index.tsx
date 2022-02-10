import React from 'react';
import { Tab } from 'semantic-ui-react';
import { Props } from './types';
import { Basic } from './Basic';
import { Advanced } from './Advanced';
import styles from './styles.module.less';

export const Form = (props: Props) => {

  const panes = [
    { menuItem: 'Basic', render: () => <Basic {...props} /> },
    { menuItem: 'Advanced', render: () => <Advanced {...props} /> },
  ]

  return <Tab className={styles.container} panes={panes} />;
};
