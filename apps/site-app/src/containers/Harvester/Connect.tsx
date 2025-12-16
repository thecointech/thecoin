import React, { useCallback, useMemo } from 'react';
import { AccountMap } from '@thecointech/redux-accounts';
import { useLocation } from 'react-router';
import { HDNodeWallet } from 'ethers';
import type { ConnectionValues } from '@thecointech/types';

function getCurrentAccountEncrypted(address: string) {
  const account = localStorage[address];
  if (!account) return undefined;
  try {
    const jsonAccount = JSON.parse(account);
    const signer = jsonAccount.signer ?? jsonAccount;
    // Strip non-essential fields to keep payload smaller
    if (signer["x-ethers"]) delete signer["x-ethers"];
    if (signer.version) delete signer.version;
    return JSON.stringify(signer);
  } catch {
    return undefined;
  }
}

function buildForm(port: string, state: string, fields: ConnectionValues) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `http://127.0.0.1:${encodeURIComponent(port)}/callback/${encodeURIComponent(state)}`;
  form.style.display = 'none';
  form.acceptCharset = 'UTF-8';

  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export const HarvesterConnect: React.FC = () => {
  const active = AccountMap.useActive();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const port = search.get('port') || '';
  const state = search.get('state') || '';

  const walletFile = useMemo(() => {
    if (!active?.address) return undefined;
    return getCurrentAccountEncrypted(active.address);
  }, [active?.address]);

  const mnemonic = useMemo(() => {
    const signer = active?.signer as HDNodeWallet;
    if (!signer?.mnemonic) return undefined;
    return {
      phrase: signer.mnemonic.phrase,
      path: signer.path!,
      locale: signer.mnemonic.wordlist.locale,
    };
  }, [active?.address]);

  const inputsCorrect = port && state;
  const canSubmit = inputsCorrect && active?.address && mnemonic;

  const onApprove = useCallback(() => {
    if (!canSubmit || !active) return;
    const fields: ConnectionValues = {
      state,
      siteOrigin: window.location.origin,
      timestamp: Date.now().toString(),
      address: active.address,
      name: active.name,
      walletFile: walletFile!,
      ...mnemonic!,
    };
    buildForm(port, state, fields);
  }, [canSubmit, active, port, state, walletFile]);

  const onCancel = useCallback(() => {
    // Just navigate away or show a message. For now, go to settings page.
    window.history.length > 1 ? window.history.back() : (window.location.href = '/');
  }, []);

  if (!active) return <div>Please select or create an account first.</div>;

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 20 }}>
      <h2>Connect Harvester</h2>
      <p>The Harvester app is requesting to connect to your account.</p>
      <div style={{ padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, marginBottom: 16 }}>
        <div><strong>Active address</strong></div>
        <div style={{ fontFamily: 'monospace' }}>{active.address}</div>
      </div>
      {!inputsCorrect && (
        <div style={{ color: '#b00', marginBottom: 16 }}>
          The connection request is missing or malformed.  Please try again.
        </div>
      )}
      {!walletFile && (
        <div style={{ color: '#b00', marginBottom: 16 }}>
          Unable to locate your encrypted wallet in this browser. Please ensure you are signed in and have a configured account on this device.
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onApprove} disabled={!canSubmit}>
          Approve
        </button>
        <button onClick={onCancel}>
          Cancel
        </button>
      </div>
      <div style={{ marginTop: 12, color: '#666' }}>
        By approving, the encrypted wallet keyfile for the active account will be sent to your local Harvester app running on this device.
      </div>
    </div>
  );
};
