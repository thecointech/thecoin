import React from "react";
import { FormattedMessage } from "react-intl";
import styles from './styles.module.less';

const loginLink = {
  id: "site.MainNavigation.loginLink",
  defaultMessage: "LOG IN",
  description: "Link to app login page"
};

export const LoginLink = () =>
  <a href={process.env.URL_SITE_APP} className={styles.loginLink}>
    <FormattedMessage {...loginLink} />
  </a>
