import { Login as LoginUI } from "@thecointech/shared/containers/Login";
import { Account, AccountState } from '@thecointech/shared/containers/Account';
import { Redirect } from 'react-router';
import { useEffect, useState } from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { isLocal } from '@thecointech/signers';

export const Login = ({account}: {account: AccountState}) => {
  // Start the account store (redux etc)
  const [complete, setComplete] = useState(false);
  Account(account.address).useStore();
  const active = AccountMap.useActive();

  useEffect(() => {
    if (!active?.contract) return;
    const {signer} = active;
    if (!isLocal(signer)) {
      alert("Using harvester with remote accounts is not currently supported.  Ping me for details");
      throw new Error("Cannot continue, must give up...");
    }

    // pass the unlocked account to scraper.  This will
    // need some hard-core protection in time...
    window.scraper.setWalletMnemomic(signer.mnemonic)
      .then(() => {
        setComplete(true)
      });
  }, [active?.contract])


  return complete
    ? <Redirect to="/account/plugins" />
    : <LoginUI account={account} />
}
