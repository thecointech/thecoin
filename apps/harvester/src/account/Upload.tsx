import { UploadWallet, UploadData } from "@thecointech/shared/containers/UploadWallet";
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useHistory } from 'react-router-dom';
import { useEffect } from "react";
import { useRef } from "react";

export const Upload = () => {

  const hasUploaded = useRef(false);
  const api = AccountMap.useApi();
  const active = AccountMap.useActive();
  const existing = AccountMap.useAsArray();
  const navigate = useHistory();

  useEffect(() => {
    const existingAddress = active?.address;
    api.setActiveAccount(null);
    hasUploaded.current = false;
    return () => {
      if (existingAddress && !hasUploaded.current) {
        try {
          api.setActiveAccount(existingAddress);
        }
        // this will happen if the
        catch {}
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
