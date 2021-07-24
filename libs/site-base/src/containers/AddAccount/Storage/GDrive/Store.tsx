import React from 'react';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { defineMessage } from 'react-intl';
import { completeStore } from './googleUtils';
import { log } from '@thecointech/logging';
import { isLocal } from '@thecointech/signers';
import { useAccountApi } from '@thecointech/shared/containers/Account/reducer';
import { GDriveBase } from './Base';

const text = defineMessage({ defaultMessage: "Store on Google Drive", description: "Store Account: Option to store on GDrive" });

export const GDriveStore = () => {

  const account = useActiveAccount();
  const api = useAccountApi(account!.address);

  const wallet = (account && isLocal(account.signer))
  ? account.signer
  : undefined;

  ////////////////////////////////////////////////////////////////
  const onAuth = async (token: string) => {
    if (wallet) {
      log.trace("Commencing upload of: " + wallet.address);
      if (await completeStore(token, wallet.address))
      {
        log.trace('Upload complete');
        api.setDetails({storedOnGoogle: true})
      }
      else {
        log.error('Upload Failed');
        // TODO: Report error
      }
    }
  };

  ////////////////////////////////////////////////////////////////

  return <GDriveBase onAuth={onAuth} text={text} />
}
