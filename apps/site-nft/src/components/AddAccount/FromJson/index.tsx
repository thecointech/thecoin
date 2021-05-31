import React from "react";
import { Container } from "semantic-ui-react";
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';
import { UploadWallet, ReadFileData } from "@thecointech/shared/containers/UploadWallet";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

const explanation = { id:"app.account.restore.createAccount.explanation",
                        defaultMessage:"Don’t have an account?",
                        description:"The text before the button to redirect to the create an account page for the restore your account page"};

const buttonCreate = { id:"app.account.restore.createAccount.button",
                        defaultMessage:"Create Account",
                        description:"The button to redirect to the create an account page for the restore your account page"};

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
          <FormattedMessage {...explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <ButtonPrimary as={Link} to="/addAccount" size='medium' >
            <FormattedMessage {...buttonCreate}/>
          </ButtonPrimary>
        </div>
    </Container>
  );
}
