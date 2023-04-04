import { UploadWallet, UploadData } from "@thecointech/shared/containers/UploadWallet";
import { AccountMap } from '@thecointech/shared/containers/AccountMap';

export const Upload = () => {

  const api = AccountMap.useApi();
  const onUpload = (data: UploadData) => {
    // accountsApi.addAccount(data.name, data.wallet.address, data.wallet);
    // history.push("/accounts");
    api.addAccount(data.name, data.wallet.address, data.wallet);
  }
  return (
    <div>
      <UploadWallet onUpload={onUpload} />
    </div>
  );
}
