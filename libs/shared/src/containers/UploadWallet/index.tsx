import * as React from 'react';
import { Label, Container, Header, Grid } from 'semantic-ui-react';
import { IsValidAddress } from '@the-coin/utilities';
import styles from './index.module.css';
import { FormattedMessage } from 'react-intl';
import messages from './messages'
import { useState } from 'react';
import { useCallback } from 'react';
import { useAccount } from '../Account/reducer';

type ReadFileCallback = (path: File) => Promise<string>;
type ValidateCallback = (address: string) => boolean;

interface Props {
  readFile: ReadFileCallback;
  validate?: ValidateCallback;
}

export const UploadWallet = (props: Props) => {
  // We use a random ID to avoid conflicting with other
  // existing reducers.  This reducer will be renamed, so
  // the name is not important, it just needs to be random
  // and constant for the lifetime of this class
  // We store it in state to give it peristance
  const [id] = useState('upload' + Math.random());
  const walletActions = useAccount(id)
  
  const onRecieveFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { wallet, name } = await ReadFile(e, props.readFile);
    const isValid = ValidateFile(wallet, props.validate);
    if (isValid) {
      walletActions.setSigner(name, wallet);
    } else {
      alert('Bad Wallet');
    }
  }, [walletActions])

  return (
    <Container id="formCreateAccountStep1">
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>
      <Container>
        <Label width="4" as="label" htmlFor={id} size="huge" className={styles.dropzone}>
          <Grid>
            <Grid.Row columns={1}>
              <Grid.Column verticalAlign="middle">
                <p>Drag 'n' drop a wallet file here, or click to browse</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Label>
        <input id={id} hidden type="file" accept=".json" onChange={onRecieveFile} />
      </Container>
    </Container>
  );
}

const ReadFile = async (e: React.ChangeEvent<HTMLInputElement>, cb: ReadFileCallback) => {
  const { files } = e.target;
  if (!files) throw 'Empty or Missing FileList';

  const file = files[0];
  const data = await cb(file);
  const wallet = JSON.parse(data.trim());
  const name = file.name.split('.')[0];
  return { wallet, name };
}

const ValidateFile = async (jsonWallet: any, validate?: ValidateCallback) => {
  const { address } = jsonWallet;
  return validate ? validate(address) : IsValidAddress(address);
}