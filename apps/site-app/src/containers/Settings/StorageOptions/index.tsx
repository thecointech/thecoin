import React, { useState, useCallback } from 'react';
import { Download } from './download';
import { Container, Header } from "semantic-ui-react"
import { isWallet } from '@thecointech/shared/SignerIdent';
import { Props as MessageProps, MaybeMessage } from "@thecointech/site-base/components/MaybeMessage"
import { StoreGoogle, UploadState } from 'containers/StoreOnline/Google';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

import google from './images/icon_google_drive_small.svg';

const title = { id:"app.settings.storageOptions.title",
                defaultMessage:"Back up",
                description:"Title for the tab Storage options in the setting page in the app" };
const description = { id:"app.settings.storageOptions.description",
                defaultMessage:"Your account backed up with:",
                description:"Description for the tab Storage options in the setting page in the app" };
const descriptionSave = { id:"app.settings.storageOptions.descriptionSave",
                defaultMessage:"You can download the account file, or print it as a QR code.",
                description:"Label for the info for the tab Storage options in the setting page in the app" };
const labelGoogle = { id:"app.settings.storageOptions.labelGoogle",
                defaultMessage:"Google Drive",
                description:"Label for Google Drive in the tab Storage options in the setting page in the app" };

export function StorageOptions() {

  const activeAccount = useActiveAccount();
  const isLocal = isWallet(activeAccount!.signer);

  const [feedback, setFeedback] = useState({} as MessageProps)
  const onStateChange = useCallback((_state: UploadState, message: MessageProps) => {
    setFeedback(message);
  }, [setFeedback])

  return isLocal
  ? <Container>
      <MaybeMessage {...feedback} />
        <Header as='h5' className={"appTitles"}>
          <FormattedMessage {...title} />
          <Header.Subheader>
            <FormattedMessage {...description} />
          </Header.Subheader>
        </Header>
        <div className={ `border-bottom-green4 x4spaceBefore ${styles.lineSave}`}>
          <span>
            <img src={google} />
            <FormattedMessage {...labelGoogle} />
          </span>
          <span className={styles.toggleZone}><StoreGoogle onStateChange={onStateChange} toggle={true} /></span>
        </div>

        <div className={ `border-bottom-green4 x4spaceBefore ${styles.lineSave}`}>
          <span>
            <img src={google} />
            <FormattedMessage {...labelGoogle} />
          </span>
          <span className={styles.toggleZone}><StoreGoogle onStateChange={onStateChange} toggle={true} /></span>
        </div>

        <div className={`x18spaceAfter`}>
          <div className={ `x6spaceBefore x4spaceAfter`}>
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
