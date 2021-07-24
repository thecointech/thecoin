import React from 'react';
import { Download } from '@thecointech/site-base/containers/AddAccount/Storage/Offline/Store';
import { Container, Header } from "semantic-ui-react"
import { isLocal } from '@thecointech/signers';
// import { Props as MessageProps, MaybeMessage } from "@thecointech/site-base/components/MaybeMessage"
// import { UploadState } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { defineMessage, FormattedMessage } from 'react-intl';
import styles from './styles.module.less';

import google from './images/icon_google_drive_small.svg';

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

  const activeAccount = useActiveAccount();
  const isLocal = isLocal(activeAccount!.signer);

  // const [feedback, setFeedback] = useState({} as MessageProps)
  // const onStateChange = useCallback((_state: UploadState, message: MessageProps) => {
  //   setFeedback(message);
  // }, [setFeedback])

  return isLocal
    ? <Container>
        {/* <MaybeMessage {...feedback} /> */}
        <Header as='h5' className={"appTitles"}>
          <FormattedMessage {...title} />
          <Header.Subheader>
            <FormattedMessage {...description} />
          </Header.Subheader>
        </Header>
        <div className={`border-bottom-green4 x4spaceBefore ${styles.lineSave}`}>
          <span>
            <img src={google} />
            <FormattedMessage {...labelGoogle} />
          </span>
          <span className={styles.toggleZone}>
            {/* <StoreGoogle onStateChange={onStateChange} toggle={true} /> */}
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
