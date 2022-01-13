import * as React from 'react';
import { Label, Container, Header, Grid } from 'semantic-ui-react';
import { IsValidAddress } from '@thecointech/utilities';
import styles from './styles.module.less';
import { defineMessages, FormattedMessage } from 'react-intl';
import { AccountMap } from '../AccountMap';
import { useHistory } from 'react-router';

import illustration from "./images/illust_flowers.svg";

const translate = defineMessages({
  aboveTheTitle: {
    defaultMessage: "Restore Account",
    description: "shared.account.uploadWallet.aboveTheTitle: The above the title title for the upload your account page"
  },
  title: {
    defaultMessage: "Load an Account",
    description: "shared.account.uploadWallet.title: Title for the upload your account page"
  },
  dropZone: {
    defaultMessage: "Drag 'n' drop a wallet file here, or click to browse",
    description: "shared.account.uploadWallet.dropZone: The title for the drop zone on the upload your account page"
  }
});

export type ReadFileData = {
  wallet: string;
  name: string|undefined;
}
type ReadFileCallback = (path: File) => Promise<ReadFileData>;
type ValidateCallback = (address: string) => boolean;

interface Props {
  readFile: ReadFileCallback;
  validate?: ValidateCallback;
}

// Random ID to connect input & label
const id = '__upload26453312f';

export const UploadWallet = (props: Props) => {

  const history = useHistory();
  const accountsApi = AccountMap.useApi();

  const onRecieveFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { wallet, name } = await ReadFile(e, props.readFile);
    const isValid = await ValidateFile(wallet, props.validate);

    if (isValid) {
      accountsApi.addAccount(name, wallet.address, wallet);
      history.push("/accounts");
    } else {
      alert('Bad Wallet');
    }
  }

  return (
    <Container className={styles.content}>
      <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...translate.aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x12spaceAfter`}>
          <FormattedMessage {...translate.title} />
      </Header>
      <Label width="4" as="label" htmlFor={id} size="huge" id={styles.dropzone} className={`x10spaceAfter`} >
        <Grid>
          <Grid.Row columns={1}>
            <Grid.Column verticalAlign="middle">
              <p>
                <FormattedMessage {...translate.dropZone} />
              </p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Label>
      <input id={id} hidden type="file" accept=".json" onChange={onRecieveFile} />

      <div className={styles.illustration} >
          <img src={illustration} />
      </div>
    </Container>
  );
}

const ReadFile = async (e: React.ChangeEvent<HTMLInputElement>, cb: ReadFileCallback) => {
  const { files } = e.target;
  if (!files) throw 'Empty or Missing FileList';

  const file = files[0];
  let { wallet, name } = await cb(file);
  const asJson = JSON.parse(wallet.trim());
  const asName = name ?? file.name.split('.')[0];
  return { wallet: asJson, name: asName };
}

const ValidateFile = async (jsonWallet: any, validate?: ValidateCallback) => {
  const { address } = jsonWallet;
  return validate ? validate(address) : IsValidAddress(address);
}
