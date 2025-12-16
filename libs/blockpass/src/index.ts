import React from 'react';
import { useScript } from '@thecointech/shared';

declare global {
  interface Window {
    BlockpassKYCConnect: any;
  }
}

export function useBlockpass(address: string, email: string|undefined, onClose: () => void) {
  const state = useScript('https://cdn.blockpass.org/widget/scripts/release/3.0.2/blockpass-kyc-connect.prod.js');

  React.useEffect(() => {
    if (state != "ready") return;
    // The first render, this will be null and we'll need to skip
    if (!window.BlockpassKYCConnect) return;
    const blockpass = new window.BlockpassKYCConnect(
      process.env.BLOCKPASS_CLIENT_ID,
      {
        refId: address,
        email: email,
      })

    blockpass.on('KYCConnectClose', onClose)

    blockpass.startKYCConnect();
  }, [state])

  return state;
}
