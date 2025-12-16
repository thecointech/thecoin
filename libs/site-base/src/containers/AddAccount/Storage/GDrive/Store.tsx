import React from 'react';
import { AccountMap } from '@thecointech/redux-accounts';
import { Account, IActions } from '@thecointech/shared/containers/Account';
import { defineMessage } from 'react-intl';
import { completeStore } from './googleUtils';
import { log } from '@thecointech/logging';
import { isLocal } from '@thecointech/signers';
import { ProviderChoice } from '../ProviderChoice';
import { useGoogle } from './useGoogle';

import icon from './images/google.svg'
const text = defineMessage({ defaultMessage: "Store on Google Drive", description: "Store Account: Option to store on GDrive" });

////////////////////////////////////////////////////////////////
const onAuth = async (token: string, address: string, api: IActions) => {
  log.trace({ address: address }, "Commencing backup of {address} to GDrive");
  if (await completeStore(token, address)) {
    log.trace({ address: address }, 'GDrive backup of {address} complete');
    api.setDetails({ storedOnGoogle: true });
  }
  else {
    log.error({ address: address }, 'Backup of {address} failed');
    throw new Error(`GDrive backup failed`)
  }
};

export const useGoogleStore = (address: string): [boolean, () => void] => {
  const api = Account(address).useApi();
  const [loading, doUpload] = useGoogle();
  return [loading, () => doUpload(token => onAuth(token, address, api))];
}

////////////////////////////////////////////////////////////////
export const GDriveStore = () => {

  const account = AccountMap.useActive();
  const [loading, doUpload] = useGoogleStore(account!.address);

  const wallet = isLocal(account?.signer)
    ? account!.signer
    : undefined;

  return wallet
    ? <ProviderChoice
      onClick={doUpload}
      loading={loading}
      imgSrc={icon}
      txt={text}
    />
    : <div>ERROR: Cannot run without account</div>
}
