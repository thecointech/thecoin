import * as React from 'react';
import { Form, Header, Accordion, Icon, List, Button, AccordionTitleProps } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import AnimateHeight from 'react-animate-height';

import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { weSellAt } from '@the-coin/shared/containers/FxRate/reducer';
import { TheSigner } from '@the-coin/shared/SignerIdent';

import { GetSignedMessage } from '@the-coin/utilities/SignedMessages';
import { GetETransferApi } from '../../../api';
import messages from './messages';
import InteraceTransfer from './Interac-eTransfer.png';
import InteraceOnline from './Interac-online.png';
import styles from './styles.module.less';
import { ETransferModal } from './eTransferModal';

interface MyProps {
  signer: TheSigner;
}
interface ActiveElement {
  key: string;
  active: string;
}

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

  onSubmit = () => {
    alert('NOT IMPLEMENTED');
  };

  onValueChange = (value: number) => {
    this.setState({
      cadPurchase: value,
    });
  };

  accordionClick = (_: React.MouseEvent<HTMLDivElement, MouseEvent>, titleProps: AccordionTitleProps) => {
    const { index } = titleProps;
    const { activeAccordion } = this.state;
    const newIndex = activeAccordion === index
      ? undefined
      : typeof(index) === 'string'
        ? parseInt(index)
        : index;

    this.setState({ activeAccordion: newIndex });
  };

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
    const { rates } = this.props;
    const rate = weSellAt(rates);

    return (
      <>
        <div className={styles.wrapper}>
          <Form>
            <Header as="h5">
              <Header.Subheader>
                <FormattedMessage {...messages.subHeader} />
              </Header.Subheader>
            </Header>

            <DualFxInput
              onChange={this.onValueChange}
              maxValue={3000}
              value={this.state.cadPurchase}
              fxRate={rate}
            />
          <List divided relaxed>
            <List.Item>Sign into your finacial institution</List.Item>
            <List.Item>
              Navigate to where you can send an Interac Email Transfer
            </List.Item>
            <List.Item>
              <Button onClick={this.onGenerateRecipient}>Generate</Button>
              your personalized e-Transfer recipient
            </List.Item>
            <List.Item>
              Create a new recipient in your financial institution with the
              given details
            </List.Item>
            <List.Item>
              Send the amount you wish to deposit. It will be credited to your
              account within 2 working days.
            </List.Item>
          </List>
            
          </Form>
          <ETransferModal {...this.state} onCloseDlg={this.onCloseDlg} />
        </div>
      </>
    );
  }
}

export const Purchase = connect(selectFxRate)(PurchaseClass);
