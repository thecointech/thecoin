import * as React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { AccountMap } from '@thecointech/redux-accounts';
import { GetSignedMessage } from '@thecointech/utilities/SignedMessages';
import { ETransferModal } from './eTransferModal';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import illustration from './images/img_interaclogo.svg';
import styles from './styles.module.less';
import { Grid } from 'semantic-ui-react';
import { useState } from 'react';
import { GetETransferApi } from '@thecointech/apis/broker';

const translations = defineMessages({
  signin: {
    defaultMessage: 'Sign into your financial institution. Navigate to where you can send an Interac Email Transfer',
    description: 'app.purchase.signin: Content for the purchase list explanation page in the app'
  },
  buttonGenerate: {
    defaultMessage: 'Generate',
    description: 'app.purchase.button: Name for the button Generate in the purchase list explanation page in the app'
  },
  generate: {
    defaultMessage: 'Generate your personalized e-Transfer recipient ',
    description: 'app.purchase.generate: Content for the purchase list explanation page in the app'
  },
  newRecipient: {
    defaultMessage: 'Create a new recipient in your financial institution with the given details',
    description: 'app.purchase.newRecipient: Content for the purchase list explanation page in the app'
  },
  deposit: {
    defaultMessage: 'Send the amount you wish to deposit. It will be credited to your account within 2 working days.',
    description: 'app.purchase.deposit: Content for the purchase list explanation page in the app'
  },
  readonlyRecipient: {
    defaultMessage: 'Disabled for readonly account',
    description: 'app.purchase.readonlyRecipient: Message shown when trying to generate recipient for readonly account'
  },
  readonlySecret: {
    defaultMessage: '~none~',
    description: 'app.purchase.readonlySecret: Secret placeholder for readonly account'
  }
});

export const Purchase = () => {

  const intl = useIntl();
  const account = AccountMap.useActive()!;
  const [showDlg, setShowDlg] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [secret, setSecret] = useState('');

  const generateRecipient = async () => {
    setShowDlg(true);

    // Check if account is readonly
    if (account.readonly) {
      setRecipient(intl.formatMessage(translations.readonlyRecipient));
      setSecret(intl.formatMessage(translations.readonlySecret));
      return;
    }

    // Build our request
    const { signer, address } = account;
    const ts = Date.now().toString();
    const request = await GetSignedMessage(ts, signer);
    const api = GetETransferApi();
    const response = await api.eTransferInCode(request);

    // Display to user
    const toAddress = `${address}@thecoin.io`.toLowerCase();
    setRecipient(toAddress);
    setSecret(response.data.code ?? 'TheCoin')
  }

  return (
    <div id={styles.appList}>
      <ol className={"ui list"}>
        <li>
          <div className={styles.line}></div>
          <Grid>
            <Grid.Row>
              <Grid.Column floated='left' width={11}><FormattedMessage {...translations.signin} /></Grid.Column>
              <Grid.Column floated='right' width={5}><img src={illustration} /></Grid.Column>
            </Grid.Row>
          </Grid>
        </li>
        <li>
          <div className={styles.line}></div>
          <FormattedMessage {...translations.generate} /><br />
          <ButtonTertiary onClick={generateRecipient}>
            <FormattedMessage {...translations.buttonGenerate} />
          </ButtonTertiary>
        </li>
        <li>
          <div className={styles.line}></div>
          <FormattedMessage {...translations.newRecipient} />
        </li>
        <li>
          <FormattedMessage {...translations.deposit} />
        </li>
      </ol>
      <ETransferModal
        secret={secret}
        recipient={recipient}
        showDlg={showDlg}
        onCloseDlg={() => setShowDlg(false)}
      />
    </div>
  );
}
