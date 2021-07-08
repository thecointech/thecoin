import React, { useState, useCallback } from 'react';
import { Download } from './download';
import { Container, Header } from "semantic-ui-react"
import { isWallet } from '@thecointech/utilities/SignerIdent';
import { Props as MessageProps, MaybeMessage } from "@thecointech/site-base/components/MaybeMessage"
import { StoreGoogle, UploadState } from 'containers/StoreOnline/Google';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

import google from './images/icon_google_drive_small.svg';

const translations = defineMessages({
  title : {
      defaultMessage: 'Back up',
      description: 'app.settings.storageOptions.title: Title for the tab Storage options in the setting page in the app'},
  description : {
      defaultMessage: 'Your account backed up with:',
      description: 'app.settings.storageOptions.description: Description for the tab Storage options in the setting page in the app'},
  descriptionSave : {
      defaultMessage: 'You can download the account file, or print it as a QR code.',
      description: 'app.settings.storageOptions.descriptionSave: Label for the info for the tab Storage options in the setting page in the app'},
  labelGoogle : {
      defaultMessage: 'app.settings.storageOptions.labelGoogle',
      description: 'app.settings.storageOptions.descriptionSave: Label for Google Drive in the tab Storage options in the setting page in the app'}
});

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
          <FormattedMessage {...translations.title} />
          <Header.Subheader>
            <FormattedMessage {...translations.description} />
          </Header.Subheader>
        </Header>
        <div className={ `border-bottom-green4 x4spaceBefore ${styles.lineSave}`}>
          <span>
            <img src={google} />
            <FormattedMessage {...translations.labelGoogle} />
          </span>
          <span className={styles.toggleZone}><StoreGoogle onStateChange={onStateChange} toggle={true} /></span>
        </div>

        <div className={`x18spaceAfter`}>
          <div className={ `x6spaceBefore x4spaceAfter`}>
            <FormattedMessage {...translations.descriptionSave} />
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
