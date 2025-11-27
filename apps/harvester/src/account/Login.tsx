import { Login as LoginUI } from "@thecointech/shared/containers/Login";
import { Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { isLocal } from '@thecointech/signers';
import { BaseWallet, HDNodeWallet } from "ethers";
import { groupKey } from './routes';
import { Account } from "@thecointech/shared/containers/Account";
import type { AccountState } from '@thecointech/account';
import { toCoinAccount } from "./convert";
import { useSimplePathContext } from "@/SimplePath";

export const Login = () => {
  // Basic guard component ensures we have an active account
  // We split into two to ensure we follow the rules of hooks
  // (we can't call Account.useStore() without a valid account)
  const active = AccountMap.useActive();
  return active
    ? <LoginAccount account={active} />
    : <Navigate to={`/${groupKey}`} />
}

const LoginAccount = ({account}: {account: AccountState}) => {
  Account(account.address).useStore();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!account?.contract) return;
    const {signer} = account;
    if (!isLocal(signer)) {
      alert("Using harvester with remote accounts is not currently supported.  Ping me for details");
      throw new Error("Cannot continue, must give up...");
    }

    // pass the unlocked account to scraper.  This will
    // need some hard-core protection in time...
    const hdWallet = signer as BaseWallet as HDNodeWallet;
    const coinAccount = toCoinAccount(hdWallet, account.name);
    window.scraper.setCoinAccount(coinAccount)
      .then(() => {
        setComplete(true)
      });
  }, [account?.contract])

  const context = useSimplePathContext();
  context.onValidate = () => {
    return !!account?.contract;
  }

  return complete
    ? <Navigate to={`/${groupKey}/plugins`} />
    : <LoginUI account={account} />
}
