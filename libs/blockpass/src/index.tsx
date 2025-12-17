import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

declare global {
  interface Window {
    BlockpassKYCConnect: any;
  }
}

interface BlockpassProps {
  buttonText: string;
  address: string;
  email?: string;
  onClose: () => void;
}

export function Blockpass({ address, email, onClose }: BlockpassProps) {
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady) return;

    // The first render, this will be null and we'll need to skip
    if (!window.BlockpassKYCConnect) {
      return;
    }

    const blockpass = new window.BlockpassKYCConnect(
      process.env.BLOCKPASS_CLIENT_ID,
      {
        refId: address,
        email: email,
      }
    );

    blockpass.on('KYCConnectClose', onClose);
    blockpass.startKYCConnect();

  }, [scriptReady, address, email, onClose]);

  return (
    <>
              <ButtonSecondary
            id="blockpass-kyc-connect"
            loading={state == "loading"}
            onClick={() => {
              log.debug("Opening KYC Dialog");
              accountApi.initKycProcess();
            }}
          ></ButtonSecondary>

    <Helmet>
      <script
        src="https://cdn.blockpass.org/widget/scripts/release/3.0.2/blockpass-kyc-connect.prod.js"
        async
        onLoad={() => setScriptReady(true)}
      />
    </Helmet>
    </>
  );
}
