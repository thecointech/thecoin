import React from 'react';
import { Button, Form, Header } from 'semantic-ui-react';

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

  render() {
		if (this.ShouldRedirect())
			return this.RenderRedirect();
			
    const win: any = window;
    const { web3 } = win;
    return web3 ? (
      <React.Fragment>
        <Form>
          <Header as="h1">
            <Header.Content>
              <FormattedMessage {...messages.header} />
            </Header.Content>
            <Header.Subheader>
              <FormattedMessage {...messages.subHeader} />
            </Header.Subheader>
          </Header>
          {this.RenderNameInput()}
          {this.RenderReferralInput()}
          <Button onClick={this.onConnect}>Connect to Web3</Button>
        </Form>
      </React.Fragment>
    ) : (
      <div>
        Non-Ethereum browser detected. You should consider trying MetaMask or
        the new Opera browser!'
      </div>
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
