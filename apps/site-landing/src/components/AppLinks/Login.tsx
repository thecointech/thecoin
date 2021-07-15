import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import styles from './styles.module.less';

const translations = defineMessages({
  loginLink : {
    defaultMessage: 'LOG IN',
    description: 'site.MainNavigation.loginLink: Button to log in in app'}
});

export const LoginLink = () =>
  <a href={process.env.URL_SITE_APP} className={styles.loginLink}>
    <FormattedMessage {...translations.loginLink} />
  </a>
