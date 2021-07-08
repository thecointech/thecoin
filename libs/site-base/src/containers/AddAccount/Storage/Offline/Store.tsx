import React, { useCallback } from 'react'
import FileSaver from 'file-saver';
import { getStoredAccountData } from '@thecointech/account/store';
import { defineMessage, FormattedMessage } from 'react-intl';
import { isWallet } from '@thecointech/utilities/SignerIdent';
import { ButtonSecondary } from '../../../../components/Buttons';


const buttonText = defineMessage({defaultMessage: 'DOWNLOAD', description: "Download button in settings?"});

type MyProps = {
  address: string
  onComplete?: () => void
}

export const Download = (props: MyProps) => {

  ////////////////////////////////
  const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    onDownload(props.address);
    if (props.onComplete)
      props.onComplete();
  }, [props.address]);
  ////////////////////////////////

  return (
    <ButtonSecondary onClick={onClick} >
      <FormattedMessage {...buttonText} />
    </ButtonSecondary>
  )
}


export const onDownload = (address: string) => {
  // Do not download the decrypted wallet: instead
  // we read the wallet directly from LS and download that
  const account = getStoredAccountData(address);
  if (!account) {
    alert("This account does not exist in storage");
    return;
  }
  const { signer } = account;
  if (isWallet(signer)) {
    const walletStr = JSON.stringify(signer);
    const blob = new Blob([walletStr], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, `${account.name}.wallet.json`);
  }
  else {
    alert("The active wallet is not downloadable (is this a remote wallet?)")
  }
}
