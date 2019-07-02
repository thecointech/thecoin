import React from 'react'
import { Form, Button } from 'semantic-ui-react';
import FileSaver from 'file-saver';
import { AccountState } from '@the-coin/components/containers/Account/types'
import {GetStoredWallet} from '@the-coin/components/containers/Account/storageSync';


type MyProps = {
	account: AccountState
}

export class Download extends React.PureComponent<MyProps> {

	onDownloadButton = (e: React.MouseEvent<HTMLElement>) =>
	{
		if (e) e.preventDefault();

		const {name} =this.props.account;
		// Do not download the decrypted wallet: instead
		// we read the wallet directly from LS and download that
		const wallet = GetStoredWallet(name);
		const walletStr = JSON.stringify(wallet);
		const blob = new Blob([walletStr], { type: "text/plain;charset=utf-8" });
		FileSaver.saveAs(blob, name + ".wallet.json");
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