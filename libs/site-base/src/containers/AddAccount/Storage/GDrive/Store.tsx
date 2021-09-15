import React from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Account } from '@thecointech/shared/containers/Account/reducer';
import { defineMessage } from 'react-intl';
import { completeStore } from './googleUtils';
import { log } from '@thecointech/logging';
import { isLocal } from '@thecointech/signers';
import { GDriveBase } from './Base';

const text = defineMessage({ defaultMessage: "Store on Google Drive", description: "Store Account: Option to store on GDrive" });

export const GDriveStore = () => {

  const account = AccountMap.useActive();
  const api = Account(account!.address).useApi();

  if (!account)
    return <div>ERROR: Cannot run without account</div>

  const wallet = isLocal(account.signer)
    ? account.signer
    : undefined;

  ////////////////////////////////////////////////////////////////
  const onAuth = async (token: string) => {
    if (wallet) {
      log.trace({address: account.address}, "Commencing backup of {address} to GDrive");
      if (await completeStore(token, account.address))
      {
        log.trace({address: account.address}, 'GDrive backup of {address} complete');
        api.setDetails({storedOnGoogle: true})
      }
      else {
        log.error({address: account.address}, 'Backup of {address} failed');
        throw new Error(`GDrive backup failed`)
      }
    }
  };

  ////////////////////////////////////////////////////////////////

  return <GDriveBase onAuth={onAuth} text={text} />
}
