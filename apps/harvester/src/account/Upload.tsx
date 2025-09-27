import { UploadWallet, UploadData } from "@thecointech/shared/containers/UploadWallet";
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Key, removeData, setData } from '../Training/data';
import { useHistory } from 'react-router-dom';

export const Upload = () => {

  const api = AccountMap.useApi();
  const existing = AccountMap.useAsArray();
  const navigate = useHistory();

  const onUpload = (data: UploadData) => {
    // Remove existing accounts
    existing.forEach(api.deleteAccount);
    // Delete existing request records, the new
    // account will probably want to re-request these
    removeData(Key.pluginAbsrbRequested);
    removeData(Key.pluginCnvrtRequested);
    // store new account
    setData(Key.wallet, JSON.stringify(data));
    api.addAccount(data.name, data.wallet.address, data.wallet);
    navigate.push('/account/1');
  }
  return (
    <div>
      <UploadWallet onUpload={onUpload} />
    </div>
  );
}
