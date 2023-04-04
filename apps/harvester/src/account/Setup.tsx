import { UploadWallet, UploadData } from "@thecointech/shared/containers/UploadWallet";
import { Login } from "@thecointech/shared/containers/Login";
import { useState } from 'react';
import { AccountState, buildNewAccount } from '@thecointech/account';

export const SetupAccount = () => {

  const [account, setAccount] = useState<AccountState|undefined>();
  const onUpload = (data: UploadData) => {
    // accountsApi.addAccount(data.name, data.wallet.address, data.wallet);
    // history.push("/accounts");
    const newAccount = buildNewAccount(data.name, data.wallet.address, data.wallet);
    setAccount(newAccount);
  }
  const r = UploadWallet({});
  return (
    !account
    ? <div><UploadWallet onUpload={onUpload} /></div> // <UploadWallet onUpload={onUpload} />
    : <div><Login account={account} /></div>
  );
}
