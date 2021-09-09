import React from 'react';
import { Login as Component } from '.';
import { withAccounts } from '@thecointech/storybookutils';
import { AccountMap } from '../AccountMap';
import { NormalizeAddress } from '@thecointech/utilities';

export default {
  title: "Shared/Login",
  component: Component,
  decorators: [withAccounts()],
  args: {
    pwd: "TestAccNoT"
  }
};

export const Login = () => {
  const account = AccountMap.useData().map[NormalizeAddress("445758e37f47b44e05e74ee4799f3469de62a2cb")];
  return <Component account={account!} />
}
