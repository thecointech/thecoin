import { UploadWallet, UploadData } from "@thecointech/shared/containers/UploadWallet";
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Key, setData } from '../Training/data';
import { useHistory } from 'react-router-dom';

export const Upload = () => {

  const api = AccountMap.useApi();
  const navigate = useHistory();

  const onUpload = (data: UploadData) => {
    setData(Key.wallet, JSON.stringify(data));
    api.addAccount(data.name, data.wallet.address, data.wallet);
    navigate.push('/account/login');
  }
  return (
    <div>
      <UploadWallet onUpload={onUpload} />
    </div>
  );
}
