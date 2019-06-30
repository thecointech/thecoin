import * as React from 'react';
import { connect } from 'react-redux';
//import styles from './index.module.css'
import { Label, Container, Icon } from 'semantic-ui-react';
import { IsValidAddress } from '@the-coin/utilities';
import { buildReducer } from '../Account/reducer';
import { buildMapDispatchToProps, DispatchProps } from '../Account/actions';

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
      <Container>
        <Label width="4" as="label" htmlFor={this.id} size="massive">
          <Icon name="cloud upload" size="massive" />
          Upload File
        </Label>
        <input id={this.id} hidden type="file" accept=".json" onChange={this.onChangeFile} />
      </Container>
    );
  }
}

const uploadAnonKey = '__@anonf5c95d2b';
const mapDispatchToProps = buildMapDispatchToProps(uploadAnonKey);

export const UploadWallet = buildReducer<MyProps>(uploadAnonKey)(
  connect(
    null,
    mapDispatchToProps
  )(UploadWalletClass)
);
