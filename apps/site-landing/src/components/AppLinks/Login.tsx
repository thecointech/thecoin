import React from "react";
import { defineMessage, FormattedMessage } from "react-intl";
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';

const loginLink = defineMessage({
  defaultMessage: 'LOG IN',
  description: 'site.MainNavigation.loginLink: Button to log in in app'
});

export const LoginLink = () =>
  <HeaderLink to={process.env.URL_SITE_APP ?? "/AppLogin"}>
    <FormattedMessage {...loginLink} />
  </HeaderLink>
