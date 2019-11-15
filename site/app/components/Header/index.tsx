import React from 'react';
import { injectIntl } from 'react-intl';
import styles from './index.module.css';
import Logo from './logo.svg';
import messages from './messages';

export default injectIntl(({ intl }) => (
  <div className={styles.wrapper}>
    <img
      className={styles.headerLogo}
      alt={intl.formatMessage(messages.LogoAlt)}
      src={Logo}
    />
    
    <ul>
    </ul>
  </div>
));
