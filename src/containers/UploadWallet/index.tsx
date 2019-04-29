import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Wallet } from 'ethers';
//import styles from './index.module.css'
import { Label, Container, Icon } from 'semantic-ui-react';
import { IsValidAddress } from '@the-coin/utilities';
import { GetNamedReducer } from '../../utils/immerReducer';
import { AccountReducer } from '../Account/reducer';
import { DefaultAccount } from '../Account/types';

interface MyProps {
	readFile: (path: File) => Promise<string>;
	addressMatch?: (address: string) => boolean;
}
interface InjectedProps {
	setWallet: (name: string, wallet: Wallet) => void;
}
type Props = MyProps & InjectedProps;
class UploadWalletClass extends React.PureComponent<Props> {

	private id: string = "upload" + Math.random();

	constructor(props: Props) {
		super(props);
		this.onChangeFile = this.onChangeFile.bind(this);
	}

	private async onChangeFile(e: any) {
		const files: FileList = e.target.files;
		if (!files)
			throw("Empty or Missing FileList");

		const file = files[0];
		const data = await this.props.readFile(file)
		const obj = JSON.parse(data.trim());
		this.onFileUpload(file.name, obj);
	}

	async onFileUpload(name: string, jsonWallet: any) {
		const { address } = jsonWallet;
		const { addressMatch } = this.props;
		const isValid = addressMatch ? 
		  addressMatch(address) :
		  IsValidAddress(address);
	
		if (isValid)
		  this.props.setWallet(name, jsonWallet);
		else {
		  alert("Bad Wallet");
		}
	  }

	render() {
		return (
			<Container >
				<Label width="4" as="label" htmlFor={this.id} size="massive">
					<Icon name="cloud upload" size='massive' />
					Upload File
				</Label>
				<input id={this.id} hidden type="file" accept=".json" onChange={this.onChangeFile} />
			</Container>
		);
	}
}

function mapDispatchToProps(dispatch: Dispatch): InjectedProps {
	return {
		setWallet: (name: string, wallet: Wallet) => {
			const { actions } = GetNamedReducer(AccountReducer, name, DefaultAccount);
			dispatch({
				type: actions.setWallet.type, 
				payload: wallet
			});
		}
	}
}
const UploadWallet = connect(null, mapDispatchToProps)(UploadWalletClass)
export { UploadWallet }
