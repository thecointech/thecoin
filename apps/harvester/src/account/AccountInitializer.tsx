import { ElectronSigner } from '@thecointech/electron-signer';
import { Account } from '@thecointech/shared/containers/Account';
import { useEffect } from "react";

//
// Our accounts were intended to only be available in
// after login.  The harvester can run without login
// though, so we use this component to trigger connect
// when using the ElectronSigner (which does not
// require login)
//
type AccountInitializerProps = {
  address: string;
}
export const AccountInitializer = ({ address }: AccountInitializerProps) => {
  Account(address).useStore();
  const api = Account(address).useApi();
  const data = Account(address).useData();
  useEffect(() => {
    const signer = data.signer;
    if (signer instanceof ElectronSigner) {
      if (!data.contract) {
        api.connect();
      }
    }
  }, [address, data.contract])
  return null;
}
