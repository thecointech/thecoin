import React from 'react';
import { Button, Form, Header } from 'semantic-ui-react';
import { ethers } from 'ethers';

import { NewBaseClass, initialState, BaseState } from '../NewBaseClass/index';
import { TheSigner } from '@the-coin/components/SignerIdent';
import { buildReducer } from '@the-coin/components/containers/Account/reducer';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';
import { buildMapDispatchToProps } from '@the-coin/components/containers/Account/actions';
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
    const win: any = window;
    const { ethereum, web3 } = win;
    const {
      nameValid,
      accountName,
      referrerValid,
      accountReferrer,
    } = this.state;
    if (!nameValid || !referrerValid) return false;

    if (ethereum) {
      try {
        // Request account access if needed
        await ethereum.enable();
        var provider = new ethers.providers.Web3Provider(web3.currentProvider);
        var signer = provider.getSigner();
        // Our local/stored version remembers it's address
        var address = await signer.getAddress();
        const theSigner: TheSigner = Object.assign(signer, { address });
        this.props.setSigner(accountName, theSigner);

        if (!this.registerReferral(address, accountReferrer)) return false;
        this.TriggerRedirect();
      } catch (error) {
        // User denied account access...
        //this.setState({userMessage: "Cannot connect: user cancelled"});
        return false;
      }
    }
    // Legacy dapp browsers...
    else if (web3) {
      //win.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      //	web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
      return false;
    }
    return true;
  }

  render() {
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
