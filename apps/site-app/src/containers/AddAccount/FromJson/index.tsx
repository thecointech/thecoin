import React from "react"
import { Button, Container } from "semantic-ui-react"
import { UploadWallet, ReadFileData } from "@the-coin/shared/containers/UploadWallet"
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";


const explanation = { id:"site.account.restore.createAccount.explanation", 
                        defaultMessage:"Don’t have an account?",
                        description:"The text before the button to redirect to the create an account page for the restore your account page"};

const buttonCreate = { id:"site.account.restore.createAccount.button", 
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
          <Button as={Link} to="/addAccount" primary size='medium' >
            <FormattedMessage {...buttonCreate}/>
          </Button>
        </div>
    </Container>
  );
}
