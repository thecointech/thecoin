import * as React from 'react';
import { List } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { TheSigner } from '@the-coin/shared/SignerIdent';

import { GetSignedMessage } from '@the-coin/utilities/SignedMessages';
import { GetETransferApi } from '../../../api';
import { ETransferModal } from './eTransferModal';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import illustration from './images/img_interaclogo.svg';

interface MyProps {
  signer: TheSigner;
}

const signin = { id:"app.purchase.signin",
                defaultMessage:"Sign into your finacial institution. Navigate to where you can send an Interac Email Transfer",
                description:"Content for the purchase list explanation page in the app" };
const buttonGenerate = { id:"app.makepayments.button",
                defaultMessage:"Generate",
                description:"Name for the button Generate in the purchase list explanation page in the app" };
const generate = { id:"app.makepayments.generate",
                defaultMessage:"Generate your personalized e-Transfer recipient ",
                description:"Content for the purchase list explanation page in the app" };
const newRecipient = { id:"app.makepayments.newRecipient",
                defaultMessage:"Create a new recipient in your financial institution with the given details",
                description:"Content for the purchase list explanation page in the app" };
const deposit = { id:"app.makepayments.deposit",
                defaultMessage:"Send the amount you wish to deposit. It will be credited to your account within 2 working days.",
                description:"Content for the purchase list explanation page in the app" };

const initialState = {
  cadPurchase: null as number | null,
  activeAccordion: undefined as number|undefined,

  // Transfer code vars
  showDlg: false,
  xferRecipient: undefined as string | undefined,
  xferSecret: undefined as string | undefined,
};

type StateType = Readonly<typeof initialState>;
type Props = MyProps & FxRatesState;

class PurchaseClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  onCloseDlg = () => this.setState({ showDlg: false });
  onGenerateRecipient = () => {
    this.generateRecipient();
  };

  async generateRecipient() {
    this.setState({
      showDlg: true,
    });

    // Build our request
    const { signer } = this.props;
    const ts = `${Date.now()}`;
    const request = await GetSignedMessage(ts, signer);
    const api = GetETransferApi();
    const response = await api.eTransferInCode(request);

    // Display to user
    const toAddress = `${signer.address}@thecoin.io`.toLowerCase();
    this.setState({
      xferRecipient: toAddress,
      xferSecret: response.data?.code || 'TheCoin',
    });
  }

  render() {
    return (
      <>
        <List ordered>
          <List.Item>
            <FormattedMessage {...signin} /><img src={illustration} />
          </List.Item>
          <List.Item>
            <FormattedMessage {...generate} /><br />
            <ButtonTertiary onClick={this.onGenerateRecipient}><FormattedMessage {...buttonGenerate} /></ButtonTertiary>
          </List.Item>
          <List.Item>
            <FormattedMessage {...newRecipient} />
          </List.Item>
          <List.Item>
            <FormattedMessage {...deposit} />
          </List.Item>
        </List>
        <ETransferModal {...this.state} onCloseDlg={this.onCloseDlg} />
      </>
    );
  }
}

export const Purchase = connect(selectFxRate)(PurchaseClass);
