import React, { useState } from 'react';
import { Step, Icon, Button, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { GoogleConnect } from 'containers/Accounts/Settings/gconnect';
import { PageProps } from '../PageProps';
import messages from './messages';

export const CloudStorageStep = () => (
	<>
    <Icon name="cloud upload" />
    <Step.Content>
      <Step.Title><FormattedMessage {...messages.stepHeader} /></Step.Title>
      <Step.Description><FormattedMessage {...messages.stepSubHeader} /></Step.Description>
    </Step.Content>
	</>
);

export const CloudStoragePage = (props: PageProps) => 
{
	const [complete, setComplete] = useState(false);
	return (
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
			<GoogleConnect accountName={"my account"} onComplete={() => setComplete(true)} />	
		</p>
		<Button disabled={!complete} onClick={props.onComplete}>{props.buttonText}</Button>
	</>	
	)
}
