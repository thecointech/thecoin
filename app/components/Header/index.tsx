import React from 'react';
import { injectIntl } from 'react-intl';
import styles from './index.module.css';
import Banner from './headerSmall_static.svg';
import Logo from './logo.svg';
import messages from './messages';

export default injectIntl(({ intl }) => (
  <div className={styles.wrapper}>
    <img
      className={styles.headerLogo}
      alt={intl.formatMessage(messages.LogoAlt)}
      src={Logo}
    />
    <img
      id="HeaderImageBanner"
      className={styles.headerImage}
      alt={intl.formatMessage(messages.BannerAlt)}
      src={Banner}
    />
    <p className={styles.wallStreet}>Every year Wall Street goes up</p>
    <p className={styles.inflation}>
      while inflation drains the value of bank accounts
    </p>
  </div>
));
