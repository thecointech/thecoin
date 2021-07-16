import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { selectFxRate } from '@thecointech/shared/containers/FxRate/selectors';
import { AnySigner } from '@thecointech/utilities/SignerIdent';

import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';
import { GetETransferApi } from '../../../api';
import { ETransferModal } from './eTransferModal';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import illustration from './images/img_interaclogo.svg';
import styles from './styles.module.less';
import { Grid } from 'semantic-ui-react';

interface MyProps {
  signer: AnySigner;
}

const translations = defineMessages({
  signin : {
      defaultMessage: 'Sign into your financial institution. Navigate to where you can send an Interac Email Transfer',
      description: 'app.purchase.signin: Content for the purchase list explanation page in the app'},
  buttonGenerate : {
      defaultMessage: 'Generate',
      description: 'app.purchase.button: Name for the button Generate in the purchase list explanation page in the app'},
  generate : {
      defaultMessage: 'Generate your personalized e-Transfer recipient ',
      description: 'app.purchase.generate: Content for the purchase list explanation page in the app'},
  newRecipient : {
      defaultMessage: 'Create a new recipient in your financial institution with the given details',
      description: 'app.purchase.newRecipient: Content for the purchase list explanation page in the app'},
  deposit : {
      defaultMessage: 'Send the amount you wish to deposit. It will be credited to your account within 2 working days.',
      description: 'app.purchase.deposit: Content for the purchase list explanation page in the app'}
});

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
            <div className={styles.line}></div>
            <Grid>
              <Grid.Row>
                <Grid.Column floated='left'  width={11}><FormattedMessage {...translations.signin} /></Grid.Column>
                <Grid.Column floated='right' width={5}><img src={illustration} /></Grid.Column>
              </Grid.Row>
            </Grid>
          </li>
          <li>
            <div className={styles.line}></div>
            <FormattedMessage {...translations.generate} /><br />
            <ButtonTertiary onClick={this.onGenerateRecipient}><FormattedMessage {...translations.buttonGenerate} /></ButtonTertiary>
          </li>
          <li>
            <div className={styles.line}></div>
            <FormattedMessage {...translations.newRecipient} />
          </li>
          <li>
            <FormattedMessage {...translations.deposit} />
          </li>
        </ol>
        <ETransferModal {...this.state} onCloseDlg={this.onCloseDlg} />
      </div>
    );
  }
}

export const Purchase = connect(selectFxRate)(PurchaseClass);
