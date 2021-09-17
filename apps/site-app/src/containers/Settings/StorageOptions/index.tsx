import React, { useState } from 'react';
import { Download } from '@thecointech/site-base/containers/AddAccount/Storage/Offline/Store';
import { Checkbox, Container, Dimmer, Header, Loader } from "semantic-ui-react"
import { isLocal } from '@thecointech/signers';
import { Props as MessageProps, MaybeMessage } from "@thecointech/site-base/components/MaybeMessage"
import { useGoogleStore, useGoogle } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { defineMessage, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

import google from './images/icon_google_drive_small.svg';
import { Account } from '@thecointech/shared/containers/Account';

const title = defineMessage({
  defaultMessage: "Back up",
  description: "Title for the tab Storage options in the setting page in the app"
});
const description = defineMessage({
  defaultMessage: "Your account backed up with:",
  description: "Description for the tab Storage options in the setting page in the app"
});
const descriptionSave = defineMessage({
  defaultMessage: "You can download the account file, or print it as a QR code.",
  description: "Label for the info for the tab Storage options in the setting page in the app"
});
const labelGoogle = defineMessage({
  defaultMessage: "Google Drive",
  description: "Label for Google Drive in the tab Storage options in the setting page in the app"
});

export function StorageOptions() {

  const activeAccount = AccountMap.useActive()!;
  const local = isLocal(activeAccount.signer);

  const [feedback, setFeedback] = useState<MessageProps | undefined>();
  const [loading, doUpload] = useGoogleStore(activeAccount.address);

  const checked = activeAccount?.details.storedOnGoogle;
  return local
    ? <Container>
      <MaybeMessage {...feedback} />
      <Header as='h5' className={"appTitles"}>
        <FormattedMessage {...title} />
        <Header.Subheader>
          <FormattedMessage {...description} />
        </Header.Subheader>
      </Header>
      <div className={`border-bottom-green4 x4spaceBefore ${styles.lineSave}`}>
        <Dimmer active={loading} inverted>
          <Loader />
        </Dimmer>
        <span>
          <img src={google} />
          <FormattedMessage {...labelGoogle} />
        </span>
        <span className={styles.toggleZone}>
          <Checkbox
            toggle
            disabled={loading}
            checked={activeAccount?.details.storedOnGoogle}
            onChange={() => {
              if (!checked) {
                doUpload();
              }
              else {
                // TODO: IMPLEMENT THIS;
                alert("Deleting the backup is not yet implemented")
              }
              setFeedback(undefined);
            }}
          />
        </span>
      </div>

      <div className={`x18spaceAfter`}>
        <div className={`x6spaceBefore x4spaceAfter`}>
          <FormattedMessage {...descriptionSave} />
        </div>
        <div className={`${styles.localeButtons}`}>
          <Download address={activeAccount!.address} />
        </div>
      </div>
    </Container>
    : <Container>
      This account has no locally editable settings
    </Container>
}

////////////////////////////////////////////////////////////////
const onAuth = async (token: string, address: string, api: IActions) => {
  log.trace({address: address}, "Commencing backup of {address} to GDrive");
  if (await completeStore(token, address))
  {
    log.trace({address: address}, 'GDrive backup of {address} complete');
    api.setDetails({storedOnGoogle: true})
  }
  else {
    log.error({address: address}, 'Backup of {address} failed');
    throw new Error(`GDrive backup failed`)
  }
};

export const useGoogleDelete = (address: string) : [boolean, () => void] => {
const api = Account(address).useApi();
const [loading, doUpload] = useGoogle();
return [loading, () => doUpload(token => onAuth(token, address, api))];
}
