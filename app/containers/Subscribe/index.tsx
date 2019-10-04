import React from 'react';
import { Input } from 'semantic-ui-react';

import styles from './index.module.css';

const Subscribe = () => (
  <div className={styles.search}>
    <Input action="Get Connected" placeholder="Your email" />
  </div>
);

export default Subscribe;
