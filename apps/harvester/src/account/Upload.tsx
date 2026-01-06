import { UploadWallet, UploadData } from "@thecointech/shared/containers/UploadWallet";
import { AccountMap } from '@thecointech/redux-accounts';
import { useNavigate } from 'react-router';
import { useEffect } from "react";
import { useRef } from "react";
import { log } from "@thecointech/logging";
import { useSimplePathContext } from "@/SimplePath";

export const Upload = () => {

  const hasUploaded = useRef(false);
  const api = AccountMap.useApi();
  const active = AccountMap.useActive();
  const existing = AccountMap.useAsArray();
  const navigate = useNavigate();

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
    navigate('/account/login?manual=true');
  }

  const context = useSimplePathContext();
  context.onValidate = () => {
    return !!hasUploaded.current;
  }
  return (
    <div>
      <UploadWallet onUpload={onUpload} />
    </div>
  );
}
