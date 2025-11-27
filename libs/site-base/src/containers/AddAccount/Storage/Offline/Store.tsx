import React, { useCallback } from 'react'
import FileSaver from 'file-saver';
import { getStoredAccountData } from '@thecointech/account/store';
import { defineMessage, FormattedMessage } from 'react-intl';
import { isLocal } from '@thecointech/signers';
import { ButtonSecondary } from '../../../../components/Buttons';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { Account } from '@thecointech/shared/containers/Account';
import { ProviderChoice } from '../ProviderChoice';
import icon from "./images/download.svg";

const buttonText = defineMessage({ defaultMessage: 'DOWNLOAD', description: "Download button in settings?" });
const download = defineMessage({ defaultMessage: "Download", description: "The button to download the account for the store your account page" });

type MyProps = {
  address: string
  onComplete?: () => void
}

export const OfflineStore = () => {

  const account = AccountMap.useActive()!;
  const accountApi = Account(account.address).useApi();

  ////////////////////////////////
  const onDownloadClicked = () => {
    onDownload(account.address);
    accountApi.setDetails({ storedOffline: true })
  }

  ////////////////////////////////

  return <ProviderChoice onClick={onDownloadClicked} imgSrc={icon} txt={download} />;
}

export const Download = (props: MyProps) => {

  const onClick = useCallback(() => {
    onDownload(props.address);
    if (props.onComplete)
      props.onComplete();
  }, [props.address]);

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
  if (isLocal(signer)) {
    const walletStr = JSON.stringify(signer);
    const blob = new Blob([walletStr], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, `${account.name}.wallet.json`);
  }
  else {
    alert("The active wallet is not downloadable (is this a remote wallet?)")
  }
}
