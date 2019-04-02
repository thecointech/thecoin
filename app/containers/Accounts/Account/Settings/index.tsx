import React from 'react'
import { Form, Button } from 'semantic-ui-react';
import FileSaver from 'file-saver';
import { ContainerState as AccountState } from '../types'
import {GetStored} from '../../reducerToLS';
type MyProps = {
	account: AccountState
}

class Settings extends React.PureComponent<MyProps> {
	constructor(props) {
		super(props)
		this.onDownloadButton = this.onDownloadButton.bind(this);
	}

	onDownloadButton(e: React.MouseEvent<HTMLElement>) 
	{
		if (e) e.preventDefault();

		const {name} =this.props.account;
		// Do not download the decrypted wallet: instead
		// we read the wallet directly from LS and download that
		const wallet = GetStored(name);
		const walletStr = JSON.stringify(wallet);
		const blob = new Blob([walletStr], { type: "text/plain;charset=utf-8" });
		FileSaver.saveAs(blob, name + "Wallet.json");
	}

	render() 
	{
		return (
			<Form>
				<Button onClick={this.onDownloadButton}>DOWNLOAD</Button>
			</Form>
		);
	}
}

export { Settings };
