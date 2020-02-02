import React from 'react'
import { Button } from 'semantic-ui-react';
import FileSaver from 'file-saver';
import { getStoredAccountData } from '@the-coin/shared/utils/storageSync';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { isWallet } from '@the-coin/shared/SignerIdent';


type MyProps = {
  address: string
  onComplete?: () => void
}


const onDownloadButton = (e: React.MouseEvent<HTMLElement>, address: string) => {
  if (e) e.preventDefault();

  // Do not download the decrypted wallet: instead
  // we read the wallet directly from LS and download that
  const account = getStoredAccountData(address);
  if (!account) {
    alert("This account does not exist in storage");
    return;
  }
  const {signer} = account;
  if (isWallet(signer))
  {
    const walletStr = JSON.stringify(signer);
    const blob = new Blob([walletStr], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, `${account.name}.wallet.json`);  
  }
  else {
    alert("The active wallet is not downloadable (is this a remote wallet?)")
  }
}

export const Download = (props: MyProps) =>
  <Button onClick={(e) => {
    onDownloadButton(e, props.address);
    if (props.onComplete)
      props.onComplete();
  }}
  >
    <FormattedMessage {...messages.buttonText} />
  </Button>
