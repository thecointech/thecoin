//import {GetStoredWallet} from '@the-coin/shared/containers/Account/storageSync';
import { GetSecureApi } from 'api';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'semantic-ui-react';
import { getStoredAccountData } from '@the-coin/shared/utils/storageSync';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import { isWallet } from '@the-coin/shared/SignerIdent';
import { fetchGAuthUrl, onInitiateLogin } from './googleUtils';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import { Props as MessageProps } from 'components/MaybeMessage';

export enum UploadState {
  Waiting,
  Invalid,
  Uploading,
  Failed,
  Complete,
}
export type StoreCallback = (state: UploadState, message: MessageProps) => void;

type MyProps = {
	onStateChange?: StoreCallback;
}

export const StoreGoogle = (props: MyProps) => {

  const [gauthUrl, setAuthUrl] = useState(undefined as MaybeString);
  const [enabled, setEnabled] = useState(true);
  const activeAccount = useActiveAccount();

  const {onStateChange} = props;
  const wallet = (activeAccount && isWallet(activeAccount.signer))
    ? activeAccount.signer
    : undefined;

  ////////////////////////////////////////////////////////////////
  // We ask the server for the URL we use to request the login code
  useEffect(() => {
    fetchGAuthUrl(setAuthUrl);

    if (!wallet) {
      setEnabled(false);
      onStateChange && onStateChange(
        UploadState.Invalid,
        { 
          header: messages.messageErrorRemoteHeader,
          content: messages.messageErrorRemoteMessage,
          negative: true,
        }
      )
    }

    // Don't leave this callback active
    //return () => myWindow.completeGauthLogin = undefined;
  }, [activeAccount, setAuthUrl, setEnabled, onStateChange]);


  ////////////////////////////////////////////////////////////////
  const completeCallback = useCallback(async (token: string) => {
    if (wallet) {
      if (await completeStore(token, wallet.address))
      {
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
    onInitiateLogin(gauthUrl!);
  }, [gauthUrl, completeCallback]);

  ////////////////////////////////////////////////////////////////
  const disabled = !gauthUrl || !enabled;
  return (
    <>
      <Button onClick={onConnectClick} disabled={disabled}>
          <FormattedMessage {...messages.buttonConnect} />
      </Button>
    </>
  );
}


async function completeStore(token: string, address: string) {

  // Do not upload the decrypted wallet: instead
  // we read the wallet directly from LS and download that
  const secureApi = GetSecureApi();
  const account = getStoredAccountData(address);
  if (!account) {
    // do something
    alert("warning: account not found");
    return false;
  }
  const {signer} = account;
  if (!signer || !isWallet(signer)) {
    // do something
    alert("Cannot upload: not a local account");
    return false;
  }
  const request = {
    token: {
      token
    },
    wallet: JSON.stringify(signer),
    walletName: account.name
  }

  try {
    const res = await secureApi.googlePut(request);
    return res.status == 200 && res.data;
  }
  catch (e) {
    console.error(JSON.stringify(e));
    alert("Upload failed, please contact support@thecoin.io");
  }
  return false;
}

