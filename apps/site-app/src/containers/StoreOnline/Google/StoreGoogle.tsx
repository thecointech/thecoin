import { GetSecureApi } from 'api';
import React, { useState, useEffect, useCallback } from 'react';
import { getStoredAccountData } from '@thecointech/account/store';
import { defineMessages, FormattedMessage } from 'react-intl';
import { isWallet } from '@thecointech/utilities/SignerIdent';
import { onInitiateLogin, setupCallback, UploadState, doSetup } from './googleUtils';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { Props as MessageProps } from '@thecointech/site-base/components/MaybeMessage';
import { ButtonSecondary } from '@thecointech/site-base/components/Buttons';
import { Checkbox } from 'semantic-ui-react';

const translations = defineMessages({
  messageErrorRemoteHeader: {
    defaultMessage: 'Cannot Upload',
    description: 'app.storeOnline.google.storeGoogle.messageErrorRemoteHeader'},
  messageErrorRemoteMessage: {
    defaultMessage: 'This account isn\'t stored locally, and so cannot be uploaded to Google',
    description: 'app.storeOnline.google.storeGoogle.messageErrorRemoteMessage'},
  messageSuccessHeader: {
    defaultMessage: 'Congratulations',
    description: 'app.storeOnline.google.storeGoogle.messageSuccessHeader'},
  messageSuccessMessage: {
    defaultMessage: 'You have successfully backed up your account to your personal Google Drive',
    description: 'app.storeOnline.google.storeGoogle.messageSuccessMessage'},
  messageErrorFailedUploadHeader: {
    defaultMessage: 'Upload Failed',
    description: 'app.storeOnline.google.storeGoogle.messageErrorFailedUploadHeader'},
  messageErrorFailedUploadMessage: {
    defaultMessage: 'Something went wrong, your account has not been backed up. Please contact support@thecoin.io',
    description: 'app.storeOnline.google.storeGoogle.messageErrorFailedUploadMessage'},
  buttonSuccess: {
    defaultMessage: 'Uploaded',
    description: 'app.storeOnline.google.storeGoogle.buttonSuccess'},
  buttonConnect: {
    defaultMessage: 'Connect to Google',
    description: 'app.storeOnline.google.storeGoogle.buttonConnect'}
});

export type StoreCallback = (state: UploadState, message: MessageProps) => void;

type MyProps = {
  onStateChange?: StoreCallback;
  disabled?: boolean;
  toggle?: boolean;
}

export const StoreGoogle : React.FC<MyProps> = (props) => {

  const [gauthUrl, setAuthUrl] = useState(undefined as MaybeString);
  const [state, setState] = useState(UploadState.Waiting);
  const activeAccount = useActiveAccount();

  const {onStateChange} = props;
  const wallet = (activeAccount && isWallet(activeAccount.signer))
    ? activeAccount.signer
    : undefined;

  ////////////////////////////////////////////////////////////////
  // We ask the server for the URL we use to request the login code
  useEffect(() => {

    if (!wallet) {
      setState(UploadState.Invalid);
      onStateChange && onStateChange(
        UploadState.Invalid,
        {
          header: translations.messageErrorRemoteHeader,
          content: translations.messageErrorRemoteMessage,
          negative: true,
        }
      )
    }
    else {
      doSetup(setAuthUrl, setState);
    }
    // Don't leave this callback active
    //return () => myWindow.completeGauthLogin = undefined;
  }, [wallet, setAuthUrl, setState, onStateChange]);


  ////////////////////////////////////////////////////////////////
  const completeCallback = useCallback(async (token: string) => {
    if (activeAccount) {
      console.log("Commencing upload of: " + activeAccount.name);
      setState(UploadState.Uploading);
      if (await completeStore(token, activeAccount.address))
      {
        console.log("Upload Complete!");
        setState(UploadState.Complete);
        onStateChange && onStateChange(
          UploadState.Complete,
          {
            header: translations.messageSuccessHeader,
            content: translations.messageSuccessMessage,
            success: true,
          }
        )
      }
      else {
        setState(UploadState.Failed);
        onStateChange && onStateChange(
          UploadState.Failed,
          {
            header: translations.messageErrorFailedUploadHeader,
            content: translations.messageErrorFailedUploadMessage,
            success: true,
          }
        )
      }
    }
  }, [wallet]);

  ////////////////////////////////////////////////////////////////
  const onConnectClick = useCallback(() => {
    setupCallback(completeCallback);
    onInitiateLogin(gauthUrl!);
  }, [gauthUrl, completeCallback]);

  ////////////////////////////////////////////////////////////////
  const loading = state === UploadState.Waiting
                || state === UploadState.Uploading;
  const disabled = state === UploadState.Invalid
                || state === UploadState.Complete
                || props.disabled;

  const message = state === UploadState.Complete
    ? translations.buttonSuccess
    : translations.buttonConnect

  const connectVia = (props.toggle)
    ? <Checkbox toggle disabled={disabled} onClick={onConnectClick} />
    : <ButtonSecondary onClick={onConnectClick} disabled={disabled} loading={loading}><FormattedMessage {...message } /></ButtonSecondary>;

  const linkConnect = props.children ? <a onClick={onConnectClick}>{props.children}</a> : undefined;

  return (
    <div>
      {linkConnect ?? connectVia}
    </div>
  );
}

async function completeStore(token: string, address: string) {

  // Do not upload the decrypted wallet: instead
  // we read the wallet directly from LS and upload that
  // This is because we trust our (soon to be sandboxed) storage to have
  // the right account data, but we do not trust what's in-memory
  const secureApi = GetSecureApi();

  // This should succeed, all these checks should have happened already
  const {wallet,name} = fetchAndVerifyWallet(address);

  const request = {
    token: {
      token
    },
    wallet: JSON.stringify(wallet),
    walletName: name
  }

  try {
    const res = await secureApi.googlePut(request);
    console.log("got: " + JSON.stringify(res));
    return res.status === 200 && res.data;
  }
  catch (e) {
    console.error(JSON.stringify(e));
    alert(<FormattedMessage {...translations.messageErrorFailedUploadMessage} />);
  }
  return false;
}

function fetchAndVerifyWallet(address: string) {
  const account = getStoredAccountData(address);
  if (account == null) {
    alert(<FormattedMessage {...translations.messageErrorRemoteMessage} />); 
    throw new Error("Could not find local account: " + address);
  }

  const wallet = account.signer;
  if (!isWallet(wallet)) {
    alert(<FormattedMessage {...translations.messageErrorRemoteMessage} />);
    throw new Error("Could not find local account: " + address);
  }
  else if (wallet.privateKey) {
    alert(<FormattedMessage {...translations.messageErrorFailedUploadMessage} />);
    throw new Error("Cannot upload wallet with private key");
  }
  return { wallet, name: account.name };
}
