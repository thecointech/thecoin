import React from 'react';
import { Step, Button, Image, Header, Message } from 'semantic-ui-react';
import { PageProps } from '../../../../PageProps';
import Logo from './LogoBlack.svg';
import styles from './index.module.css';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { BuildCreateUrl } from '../Types';
import { CopyToClipboard } from 'components/CopyToClipboard';


export const InstallOperaStep = () => (
  <>
    <Image className={styles.LogoBlack} src={Logo} avatar circular />
    <Step.Content>
      <Step.Title>Opera</Step.Title>
      <Step.Description>Install Opera Browser</Step.Description>
    </Step.Content>
  </>
);

export const InstallOperaPage = (props: PageProps) => {
  const win: any = window;
  const { web3 } = win;
  const hasWeb3 = !!web3;

  const url = `${window.location.origin}/#${BuildCreateUrl(props.options)}`;
  const content = hasWeb3 ? (
    <Message>
      <FormattedMessage {...messages.detected} />
    </Message>
    ) : (
      <>
        <p><FormattedMessage {...messages.para1} /></p>
        <p>
          <FormattedMessage {...messages.installLinkPre} />
          <a href="https://www.opera.com/download" target="_blank">
            <FormattedMessage {...messages.installLink} />
          </a>
        </p>
        <p>
          <FormattedMessage {...messages.copyPageLinkPre} />
          <CopyToClipboard payload={url}>
            <FormattedMessage {...messages.copyPageLink} />
          </CopyToClipboard>
          <FormattedMessage {...messages.copyPageLinkPost} />
        </p>
        <p>
          <FormattedMessage {...messages.connectTutPre} />
          <a href="https://help.opera.com/en/how-to-use-operas-crypto-wallet-on-your-computer/" target="_blank">
            <FormattedMessage {...messages.connectTut} />
          </a>
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
  );
};
