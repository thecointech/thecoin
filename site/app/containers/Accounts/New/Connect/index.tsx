import React from 'react';
import { Button, Form, Header, Message } from 'semantic-ui-react';

import { NewBaseClass, initialState, BaseState } from '../NewBaseClass/index';
import { buildReducer } from '@the-coin/components/containers/Account/reducer';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';
import { buildMapDispatchToProps } from '@the-coin/components/containers/Account/actions';
import { ConnectWeb3 } from '@the-coin/components/containers/Account/Web3';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

class ConnectClass extends NewBaseClass<BaseState> {
  state = initialState;

  onConnect = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (await this.tryConnect()) this.setState(initialState);
  };

  async tryConnect() {
    const {
      nameValid,
      accountName,
      referrerValid,
      accountReferrer,
    } = this.state;
    if (!nameValid || !referrerValid) return false;

    const theSigner = await ConnectWeb3();
    if (theSigner) {
      // Ensure this account is appropriately referred
      if (!this.registerReferral(theSigner.address, accountReferrer))
        return false;
      this.props.setSigner(accountName, theSigner);
      this.TriggerRedirect();
      return true;
    }
    return false;
  }

  RenderWarning = () => (
    <Message warning>
      <Message.Header>
        <FormattedMessage {...messages.warningHeader} />
      </Message.Header>
      <p><FormattedMessage {...messages.warningP1} /></p>
      <p><FormattedMessage {...messages.warningP2} /></p>
    </Message>
  );

  RenderContent() {
    const win: any = window;
    const { web3 } = win;
    const disabled = !web3;
    const warning = disabled ? this.RenderWarning() : undefined;
    return (
      <>
        {warning}
        <Form>
          {this.RenderNameInput(disabled)}
          {this.RenderReferralInput(disabled)}
          <Button disabled={disabled} onClick={this.onConnect}>
            Connect to Web3
          </Button>
        </Form>
      </>
    );
  }

  render() {
    if (this.ShouldRedirect()) return this.RenderRedirect();

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
        {this.RenderContent()}
      </>
    );
  }
}

const key = '__@create|ee25b960';

// We need to ensure we have the Accounts reducer live
// so we add the reducer here.
export const Connect = buildReducer<{}>(key)(
  connect(
    structuredSelectAccounts,
    buildMapDispatchToProps(key),
  )(ConnectClass),
);
