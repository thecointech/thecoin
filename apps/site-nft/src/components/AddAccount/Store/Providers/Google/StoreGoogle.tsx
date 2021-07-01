//import {GetStoredWallet} from '@thecointech/shared/containers/Account/storageSync';
import { GetSecureApi } from 'api';
import React, { useState, useEffect, useCallback } from 'react';
import { getStoredAccountData } from '@thecointech/shared/utils/storageSync';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import { isWallet } from '@thecointech/utilities/SignerIdent';
import { onInitiateLogin, setupCallback, UploadState, doSetup } from './googleUtils';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { Props as MessageProps } from '@thecointech/site-base/components/MaybeMessage';
import { ButtonSecondary } from '@thecointech/site-base/components/Buttons';
import { Checkbox } from 'semantic-ui-react';


export type StoreCallback = (state: UploadState, message: MessageProps) => void;

type MyProps = {
  onStateChange?: StoreCallback;
  disabled?: boolean;
  toggle?: boolean;
}

export const StoreGoogle = (props: MyProps) => {

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
          header: messages.messageErrorRemoteHeader,
          content: messages.messageErrorRemoteMessage,
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
            header: messages.messageSuccessHeader,
            content: messages.messageSuccessMessage,
            success: true,
          }
        )
      }
      else {
        setState(UploadState.Failed);
        onStateChange && onStateChange(
          UploadState.Failed,
          {
            header: messages.messageErrorFailedUploadHeader,
            content: messages.messageErrorFailedUploadMessage,
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
    ? messages.buttonSuccess
    : messages.buttonConnect

  const connectVia = (props.toggle)
    ? <Checkbox toggle disabled={disabled} onClick={onConnectClick} />
    : <ButtonSecondary onClick={onConnectClick} disabled={disabled} loading={loading}><FormattedMessage {...message } /></ButtonSecondary>;

  return (
    <div>
      {connectVia}
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
    alert("Upload failed, please contact support@thecoin.io");
  }
  return false;
}

function fetchAndVerifyWallet(address: string) {
  const account = getStoredAccountData(address);
  if (account == null) {
    alert("Could not find local account - if you are seeing this, contact support@thecoin.io");
    throw new Error("Could not find local account: " + address);
  }

  const wallet = account.signer;
  if (!isWallet(wallet)) {
    alert("Cannot upload this wallet: it is not a local account");
    throw new Error("Could not find local account: " + address);
  }
  else if (wallet.privateKey) {
    alert("Could upload decrypted wallet - if you are seeing this, contact support@thecoin.io");
    throw new Error("Cannot upload wallet with private key");
  }
  return { wallet, name: account.name };
}
