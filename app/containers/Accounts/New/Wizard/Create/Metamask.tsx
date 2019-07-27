import React from 'react';
import { Step, Button, Image, Header, Message } from 'semantic-ui-react';
import { PageProps } from './PageProps';
import Logo from './Metamask.logo.svg'
import styles from './Metamask.module.css'
import { FormattedMessage } from 'react-intl';
import messages from './Metamask.messages';


export const InstallMetamaskStep = () => (
	<>
    <Image className={styles.Logo} src={Logo} avatar circular />
    <Step.Content>
      <Step.Title>Metamask</Step.Title>
      <Step.Description>Install Metamask</Step.Description>
    </Step.Content>
	</>
);

export const InstallMetamaskPage = (props: PageProps) => {
  const win: any = window;
  const { web3 } = win;
  const hasWeb3 = !!web3;

  const content = hasWeb3 ? 
    <Message>
      <FormattedMessage {...messages.detected} />
    </Message> :
    (
      <>
        <p>
          <FormattedMessage {...messages.para1} />
        </p>
        <p><a href="https://words.democracy.earth/tutorial-setting-up-your-metamask-186414589d3a" target="_blank">Metamask Tutorial</a></p>
        <p>Or, if you know what your doing; </p>
        <p><a href="https://metamask.io/" target="_blank">Install Metamask</a></p>
        <p>
          <FormattedMessage {...messages.para2} />
        </p>
      </>
    );

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
    {content}
    <Button disabled={!hasWeb3} onClick={props.onComplete}>{props.buttonText}</Button>
  </>
  )
}