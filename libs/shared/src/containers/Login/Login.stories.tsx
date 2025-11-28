import React from 'react';
import { Login as Component } from '.';
import { withAccounts } from '@thecointech/storybookutils';
import { AccountMap } from '@thecointech/redux-accounts';

export default {
  title: "Shared/Login",
  component: Component,
  decorators: [withAccounts()],
  args: {
    pwd: "TestAccNoT"
  }
};

export const Login = () => {
  const account = AccountMap.useAsArray()[0];
  return <Component account={account!} />
}
