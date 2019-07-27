import React from 'react';
import { Step, Header, Button, Image } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { PageProps } from '../PageProps';
import messages from './messages';
import Vault from './vault.svg';
import styles from './index.module.css'

export const OfflineStorageStep = (active?: boolean) => (
  <>
		<Image className={styles.LogoBlack} src={Vault} avatar circular />
    <Step.Content>
      <Step.Title>Backup your Account</Step.Title>
      <Step.Description>Securely store your account</Step.Description>
    </Step.Content>
  </>
);

export const OfflineStoragePage = (props: PageProps) => (
  <>
    <Header as="h1">
      <Header.Content>
        <FormattedMessage {...messages.header} />
      </Header.Content>
      <Header.Subheader>
        <FormattedMessage {...messages.subHeader} />
      </Header.Subheader>
    </Header>
    <p>
      <FormattedMessage {...messages.para1} />
    </p>
		<p>
      <FormattedMessage {...messages.para2} />
    </p>
		{/* <p>
      <FormattedMessage {...messages.para3} />
    </p>
		<p>
      <FormattedMessage {...messages.para4} />
    </p> */}
    <Button onClick={props.onComplete}>{props.buttonText}</Button>
  </>
);
