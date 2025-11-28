import React from 'react';
import { Login as Component } from '.';
import { withAccounts, withLanguageProvider } from '@thecointech/storybookutils';
import { AccountMap } from '@thecointech/redux-accounts';
import translations from '../../translations';

export default {
  title: "Shared/Login",
  component: Component,
  decorators: [
    withLanguageProvider(translations),
    withAccounts(),
  ],
  args: {
    pwd: "TestAccNoT"
  }
};

export const Login = () => {
  const account = AccountMap.useAsArray()[0];
  return <Component account={account!} />
}
