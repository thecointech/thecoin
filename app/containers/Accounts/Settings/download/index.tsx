import React from 'react'
import { Button } from 'semantic-ui-react';
import FileSaver from 'file-saver';
import {GetStoredWallet} from '@the-coin/components/containers/Account/storageSync';
import { FormattedMessage } from 'react-intl';
import messages from './messages';


type MyProps = {
	accountName: string
	onComplete?: () => void
}


const onDownloadButton = (e: React.MouseEvent<HTMLElement>, accountName: string) =>
{
	if (e) e.preventDefault();

	// Do not download the decrypted wallet: instead
	// we read the wallet directly from LS and download that
	const wallet = GetStoredWallet(accountName);
	const walletStr = JSON.stringify(wallet);
	const blob = new Blob([walletStr], { type: "text/plain;charset=utf-8" });
	FileSaver.saveAs(blob, name + ".wallet.json");
}

export const Download = (props: MyProps) => 
	<Button onClick={(e) => {
		onDownloadButton(e, props.accountName);
		if (props.onComplete)
			props.onComplete();
	}}
	>
		<FormattedMessage {...messages.buttonText} />
	</Button>
