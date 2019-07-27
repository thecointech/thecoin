import React from 'react';
import { Step, Icon, Button, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from './OfflineStorage.messages';
import { GoogleConnect } from 'containers/Accounts/Settings/gconnect';
import { PageProps } from './PageProps';

export const OfflineStorageStep = () => (
	<>
    <Icon name="download" />
    <Step.Content>
      <Step.Title>Offline Storage</Step.Title>
      <Step.Description>Take your wallet into the real world</Step.Description>
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
		<GoogleConnect accountName={props.accountName} />
    <Button onClick={props.onComplete}>{props.buttonText}</Button>
  </>
)