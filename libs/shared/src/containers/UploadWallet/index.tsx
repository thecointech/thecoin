import * as React from 'react';
import { Label, Container, Header, Grid } from 'semantic-ui-react';
import { IsValidAddress } from '@thecointech/utilities';
import styles from './styles.module.less';
import { FormattedMessage } from 'react-intl';
import { useCallback } from 'react';
import { useAccountMapApi } from '../AccountMap';
import { useHistory } from 'react-router';

import illustration from "./images/illust_flowers.svg";


const aboveTheTitle = { id:"shared.account.uploadWallet.aboveTheTitle",
                        defaultMessage:"Restore Account",
                        description:"The above the title title for the upload your account page"};
const title = { id:"shared.account.uploadWallet.title",
                defaultMessage:"Load an Account",
                description:"Title for the upload your account page"};
const dropZone = {  id:"shared.account.uploadWallet.dropZone",
                    defaultMessage:"Drag 'n' drop a wallet file here, or click to browse",
                    description:"The title for the drop zone on the upload your account page"};

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

  const accountMapApi = useAccountMapApi()
  const history = useHistory();

  const onRecieveFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { wallet, name } = await ReadFile(e, props.readFile);
    const isValid = ValidateFile(wallet, props.validate);

    if (isValid) {
      accountMapApi.addAccount(name, wallet, true);
      accountMapApi.setActiveAccount(wallet.address);
      history.push("/accounts");
    } else {
      alert('Bad Wallet');
    }
  }, [accountMapApi, history])

  return (
    <Container className={styles.content}>
      <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x12spaceAfter`}>
          <FormattedMessage {...title} />
      </Header>
      <Label width="4" as="label" htmlFor={id} size="huge" id={styles.dropzone} className={`x10spaceAfter`} >
        <Grid>
          <Grid.Row columns={1}>
            <Grid.Column verticalAlign="middle">
              <p>
                <FormattedMessage {...dropZone} />
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
