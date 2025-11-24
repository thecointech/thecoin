import { UploadWallet, UploadData } from "@thecointech/shared/containers/UploadWallet";
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useHistory } from 'react-router-dom';
import { useEffect } from "react";
import { useRef } from "react";
import { log } from "@thecointech/logging";

export const Upload = () => {

  const hasUploaded = useRef(false);
  const api = AccountMap.useApi();
  const active = AccountMap.useActive();
  const existing = AccountMap.useAsArray();
  const navigate = useHistory();

  useEffect(() => {
    // Remove the active account.  This is so the
    // "plugins" tab does not mark as complete (
    // from the current account)
    const existingAddress = active?.address;
    api.setActiveAccount(null);
    hasUploaded.current = false;
    return () => {
      if (existingAddress && !hasUploaded.current) {
        // If we haven't uploaded a new account,
        // restore the active account
        try {
          api.setActiveAccount(existingAddress);
        }
        catch (e) {
          log.warn(e, "Failed to restore active account");
        }
      }
    }
  }, []);

  const onUpload = (data: UploadData) => {
    // Remove existing accounts
    existing.forEach(api.deleteAccount);
    api.addAccount(data.name, data.wallet.address, data.wallet);
    api.setActiveAccount(data.wallet.address);
    hasUploaded.current = true;
    navigate.push('/account/2?manual=true');
  }
  return (
    <div>
      <UploadWallet onUpload={onUpload} />
    </div>
  );
}
