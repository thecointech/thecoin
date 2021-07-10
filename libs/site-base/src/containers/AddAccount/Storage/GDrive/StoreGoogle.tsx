import React, { useState, useEffect, useCallback } from 'react';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import { isWallet } from '@thecointech/utilities/SignerIdent';
import { onInitiateLogin, setupCallback, UploadState, doSetup, completeStore } from './googleUtils';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { Props as MessageProps } from '../../../../components/MaybeMessage';
import { ButtonSecondary } from '../../../../components/Buttons';
import { Checkbox } from 'semantic-ui-react';


export type StoreCallback = (state: UploadState, message: MessageProps) => void;

type MyProps = {
  onStateChange?: StoreCallback;
  disabled?: boolean;
  toggle?: boolean;
}

export const StoreGoogle : React.FC<MyProps> = (props) => {

  const [gauthUrl, setAuthUrl] = useState(undefined as MaybeString|null);
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
      doSetup(setAuthUrl);
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

  const linkConnect = props.children ? <a onClick={onConnectClick}>{props.children}</a> : undefined;

  return (
    <div>
      {linkConnect ?? connectVia}
    </div>
  );
}

