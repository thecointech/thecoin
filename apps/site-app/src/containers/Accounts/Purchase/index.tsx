import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { selectFxRate } from '@thecointech/shared/containers/FxRate/selectors';
import { AnySigner } from '@thecointech/shared/SignerIdent';

import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';
import { GetETransferApi } from '../../../api';
import { ETransferModal } from './eTransferModal';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import illustration from './images/img_interaclogo.svg';
import styles from './styles.module.less';

interface MyProps {
  signer: AnySigner;
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
  // Transfer code vars
  showDlg: false,
  xferRecipient: undefined as string | undefined,
  xferSecret: undefined as string | undefined,
};

type StateType = Readonly<typeof initialState>;
type Props = MyProps;

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
      <div id={styles.appList}>
        <ol className={"ui list"}>
          <li>
            <FormattedMessage {...signin} /><img src={illustration} />
          </li>
          <li>
            <FormattedMessage {...generate} /><br />
            <ButtonTertiary onClick={this.onGenerateRecipient}><FormattedMessage {...buttonGenerate} /></ButtonTertiary>
          </li>
          <li>
            <FormattedMessage {...newRecipient} />
          </li>
          <li>
            <FormattedMessage {...deposit} />
          </li>
        </ol>
        <ETransferModal {...this.state} onCloseDlg={this.onCloseDlg} />
      </div>
    );
  }
}

export const Purchase = connect(selectFxRate)(PurchaseClass);
