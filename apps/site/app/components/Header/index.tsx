import React from 'react';
import { injectIntl } from 'react-intl';
import styles from './styles.module.css';
import Logo from './logoAndName.svg';
import messages from './messages';

export default injectIntl(({ intl }) => (
  <div className={styles.wrapperLogo}>
    <img
      className={styles.headerLogo}
      alt={intl.formatMessage(messages.LogoAlt)}
      src={Logo}
    />
  </div>
));
