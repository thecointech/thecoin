import React from 'react';
import { QRCode } from 'react-qr-svg';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';


export const QRConnect = () => {
  const active = useActiveAccount();
  if (!active) return <div>Account Needed</div>;
  const encryptedAccount = getCurrentAccountEncrypted(active.address);
  return (
    <div className="deviceCContainer" >
      <div>
        <span>
          Account Address: {active.address}
        </span>
      </div>
      <div>
        <div style={{ margin: 50 }}>
          <QRCode bgColor="#FFFFFF" fgColor="#000000" level="L" style={{ width: 500 }
          } value={encryptedAccount} />
        </div>
        <div>
          Want your account on your phone ?
          <p>use this qr code to get ur account info on your phone fast.</p>
        </div>
      </div>
    </div>
  );
}

function getCurrentAccountEncrypted(address: string) {
  const account = localStorage[address];
  if (!account) {
    alert('Error!  Account not found');
  }

  // We have issues with our QR codes being
  // too complex.  Strip out unnecessary data
  const jsonAccount = JSON.parse(account);
  const signer = jsonAccount.signer;
  if (signer["x-ethers"]) {
    delete signer["x-ethers"];
  }
  if (signer.version) {
    delete signer.version;
  }
  return JSON.stringify(signer);
}
