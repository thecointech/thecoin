import React from 'react';
import { Download } from '@thecointech/site-base/containers/AddAccount/Storage/Offline';
import { Checkbox, Container, Dimmer, Header, Loader } from "semantic-ui-react"
import { isLocal } from '@thecointech/signers';
import { useGoogleStore } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive';
import { AccountMap } from '@thecointech/redux-accounts';
import { defineMessage, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';
import google from './images/icon_google_drive_small.svg';

const title = defineMessage({
  defaultMessage: "Backup",
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

  const [loading, doUpload] = useGoogleStore(activeAccount.address);

  const checked = activeAccount?.details.storedOnGoogle;
  return local
    ? <Container>
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
