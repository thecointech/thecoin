import * as React from 'react';
import { connect } from 'react-redux';
import { Label, Container, Header, Grid } from 'semantic-ui-react';
import { IsValidAddress } from '@the-coin/utilities';
import { injectSingleAccountReducer } from '../Account/reducer';
import { buildMapDispatchToProps, DispatchProps } from '../Account/actions';
import styles from './index.module.css';
import { FormattedMessage } from 'react-intl';
import messages from './messages'

interface MyProps {
  readFile: (path: File) => Promise<string>;
  addressMatch?: (address: string) => boolean;
}
type Props = MyProps & DispatchProps;
class UploadWalletClass extends React.PureComponent<Props> {
  private id: string = 'upload' + Math.random();

  constructor(props: Props) {
    super(props);
    this.onChangeFile = this.onChangeFile.bind(this);
  }

  private async onChangeFile(e: any) {
    const files: FileList = e.target.files;
    if (!files) throw 'Empty or Missing FileList';

    const file = files[0];
    const data = await this.props.readFile(file);
    const obj = JSON.parse(data.trim());
    const name = file.name.split('.')[0];
    this.onFileUpload(name, obj);
  }

  async onFileUpload(name: string, jsonWallet: any) {
    const { address } = jsonWallet;
    const { addressMatch } = this.props;
    const isValid = addressMatch ? addressMatch(address) : IsValidAddress(address);

    if (isValid) {
      this.props.setSigner(name, jsonWallet);
    } else {
      alert('Bad Wallet');
    }
  }

  render() {
    return (
      <Container id="formCreateAccountStep1">
        <Header as="h1">
          <Header.Content>
            <FormattedMessage {...messages.header}/>
          </Header.Content>
          <Header.Subheader>
            <FormattedMessage {...messages.subHeader} />
          </Header.Subheader>
        </Header>
        <Container>
            <Label width="4" as="label" htmlFor={this.id} size="huge" className={styles.dropzone}>
              <Grid>
                <Grid.Row columns={1}>
                  <Grid.Column verticalAlign="middle">
                    <p>Drag 'n' drop a wallet file here, or click to browse</p>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Label>
            <input id={this.id} hidden type="file" accept=".json" onChange={this.onChangeFile} />
        </Container>
      </Container>
    );
  }
}

const uploadAnonKey = '__@anonf5c95d2b';
const mapDispatchToProps = buildMapDispatchToProps(uploadAnonKey);

export const UploadWallet = injectSingleAccountReducer<MyProps>(uploadAnonKey)(
  connect(
    null,
    mapDispatchToProps
  )(UploadWalletClass)
);
