import React from "react";
import { Container } from "semantic-ui-react";
import { ButtonPrimary } from '../../../components/Buttons';
import { UploadWallet, UploadData } from "@thecointech/shared";
import { defineMessages, FormattedMessage } from "react-intl";
import { Link, useHistory } from "react-router-dom";
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import styles from './styles.module.less';

const translations = defineMessages({
  explanation : {
      defaultMessage: 'Don’t have an account?',
      description: 'app.account.restore.createAccount.explanation: Title above the main Title for the create account form page'},
  buttonCreate : {
      defaultMessage: 'Create Account',
      description: 'app.account.restore.createAccount.button: The button to redirect to the create an account page for the restore your account page'}
});

export const FromJson = () => {
  const accountsApi = AccountMap.useApi();
  const history = useHistory();

  const onUpload = (data: UploadData) => {
    accountsApi.addAccount(data.name, data.wallet.address, data.wallet);
    history.push("/accounts");
  }

  return (
    <Container>
      <UploadWallet onUpload={onUpload} />
      <div className={styles.footer}>
        <FormattedMessage {...translations.explanation} />
        <ButtonPrimary as={Link} className={styles.button} to="/addAccount" size='medium' >
          <FormattedMessage {...translations.buttonCreate} />
        </ButtonPrimary>
      </div>
    </Container>
  )
}
