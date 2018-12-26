import React from 'react';
import { injectIntl } from 'react-intl';
import * as styles from './index.module.css';
import Banner from './headerSmall_static.svg';
import Logo from './logo.svg';
import messages from './messages';

export default injectIntl(({ intl }) => (
  <div>
    <img
      className={styles.headerLogo}
      alt={intl.formatMessage(messages.LogoAlt)}
      src={Logo}
    />
    <img
      className={styles.headerImage}
      alt={intl.formatMessage(messages.BannerAlt)}
      src={Banner}
    />
  </div>
));
