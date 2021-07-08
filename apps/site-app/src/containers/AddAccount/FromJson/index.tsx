import React from "react";
import { Container } from "semantic-ui-react";
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';
import { UploadWallet, ReadFileData } from "@thecointech/shared/containers/UploadWallet";
import { defineMessages, FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

const translations = defineMessages({
  explanation : {
      defaultMessage: 'Don’t have an account?',
      description: 'app.account.restore.createAccount.explanation: Title above the main Title for the create account form page'},
  buttonCreate : {
      defaultMessage: 'Create Account',
      description: 'app.account.restore.createAccount.button: The button to redirect to the create an account page for the restore your account page'}
});

function readFile(file: File): Promise<ReadFileData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const target = e.target;
      resolve({
        wallet: target?.result as string,
        name: undefined
      });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export const FromJson = () => {
  return (
    <Container>
      <UploadWallet readFile={readFile}/>
      <div>
          <FormattedMessage {...translations.explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <ButtonPrimary as={Link} to="/addAccount" size='medium' >
            <FormattedMessage {...translations.buttonCreate}/>
          </ButtonPrimary>
        </div>
    </Container>
  );
}
