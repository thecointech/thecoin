import { Login as LoginUI } from "@thecointech/shared/containers/Login";
import { Account, AccountState } from '@thecointech/shared/containers/Account';
import { Redirect } from 'react-router';
import { useState } from 'react';

export const Login = ({account}: {account: AccountState}) => {
  // Start the account store (redux etc)
  const [complete, setComplete] = useState(false);
  Account(account.address).useStore();

  return complete
    ? <Redirect to="/account/plugins" />
    : <LoginUI account={account} onLogin={() => setComplete(true)} />
}
