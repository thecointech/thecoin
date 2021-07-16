import React, { FunctionComponent } from 'react';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { CopyToClipboard } from '@thecointech/site-base/components/CopyToClipboard';
import { Grid } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

interface Props {
  xferRecipient?: string;
  xferSecret?: string;
  showDlg: boolean;
  onCloseDlg: () => void;
}

const translations = defineMessages({
  getTransferCodeHeader : {
      defaultMessage: 'Please wait...',
      description: 'app.accounts.purchase.getTransferCodeHeader'},
  haveTransferCodeHeader : {
      defaultMessage: 'Your details',
      description: 'app.accounts.purchase.haveTransferCodeHeader'},
  fetchTransferCode : {
      defaultMessage: 'We are generating your individual e-Transfer recipient info',
      description: 'app.accounts.purchase.fetchTransferCode'},
  yourTransferCode : {
      defaultMessage: 'The following is your personalized e-Transfer info:',
      description: 'app.accounts.purchase.yourTransferCode'},
  yourTransferRecipient : {
      defaultMessage: 'Recipient:',
      description: 'app.accounts.purchase.yourTransferRecipient'},
  yourTransferSecret : {
      defaultMessage: 'Secret:',
      description: 'app.accounts.purchase.yourTransferSecret'}
});

export const ETransferModal: FunctionComponent<Props> = (props: Props) =>
{
  const {xferRecipient, xferSecret} = props;
  return (xferSecret && xferRecipient) ?
  (
    <ModalOperation
      isOpen={props.showDlg}
      header={translations.haveTransferCodeHeader}
      okCallback={props.onCloseDlg}
      closeIconFct={props.onCloseDlg}
    >
      <Grid stackable columns={2}>
        <Grid.Row>
          <FormattedMessage {...translations.yourTransferCode} />
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width="4">
            <FormattedMessage {...translations.yourTransferRecipient} />
          </Grid.Column>
          <Grid.Column width="12">
          <CopyToClipboard payload={xferRecipient}>
            {xferRecipient+ " "}
          </CopyToClipboard>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width="4">
            <FormattedMessage {...translations.yourTransferSecret} />
          </Grid.Column>
          <Grid.Column width="12">
            <CopyToClipboard payload={xferSecret}>
              {xferSecret+ " "}
            </CopyToClipboard>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </ModalOperation>
  ) : (
    <ModalOperation
      isOpen={props.showDlg}
      header={translations.getTransferCodeHeader}
      okCallback={props.onCloseDlg}
      closeIconFct={props.onCloseDlg}
    >
      <FormattedMessage {...translations.fetchTransferCode} />
    </ModalOperation>
  )
}
