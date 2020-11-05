import * as React from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import { Button, Form, Header } from "semantic-ui-react";

import { UxPassword } from "../../components/UxPassword";
import { ModalOperation } from "../ModalOperation";

import { useState, useCallback } from "react";
import { isWallet } from "../../SignerIdent";
import { AccountState } from "../Account/types";
import { useAccountApi } from "../Account/reducer";

import illustrationPlant from './images/illust_flowers.svg';
import styles from "./styles.module.css";

interface OwnProps {
  account: AccountState;
}
type Props = OwnProps;

enum LoginState {
  Entry,
  Decrypting,
  Failed,
  Cancelled,
  Complete
}

let __cancel = false;
const onCancel = () => __cancel = true;

export const Login = (props: Props) => {
  const [loginState, setLoginState] = useState(LoginState.Entry);
  const [password, setPassword] = useState(undefined as string|undefined);
  const [percentComplete, setPercentComplete] = useState(0);

  const history = useHistory();
  const { account } = props;
  const { signer, address }= account;
  if (!isWallet(signer) || signer.privateKey) {
    history.push('/accounts/');
  }

  /////////////////////////////////
  const onPasswordChange = useCallback((value: string) => {
    setPassword(value);
    // If we are in a failed state, reset state with new keystroke
    if (loginState == LoginState.Cancelled || loginState == LoginState.Failed) {
      setLoginState(LoginState.Entry);
    }
  }, [loginState, setLoginState, setPassword]);

  ////////////////////////////////
  const accountApi = useAccountApi(address);
  const onDecryptWallet = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    __cancel = false;

    setLoginState(LoginState.Decrypting);
    if (password)
      accountApi.decrypt(password, decryptWalletCallback);
  }, [password, accountApi]);
  ////////////////////////////////
  const decryptWalletCallback = useCallback((percent: number): boolean => {
    if (__cancel) {
      setLoginState(LoginState.Cancelled);
      return false;
    } 
    else if (percent === -1) {
      // Invalid password?
      if (!__cancel) {
        setLoginState(LoginState.Failed);
      }
      return false;
    } 
    else if (percent === 100) {
      setLoginState(LoginState.Complete);
    } 
    else {
      setPercentComplete(percent);
    }
    return true;
  }, [setPercentComplete, setLoginState]);
  ////////////////////////////////

  const isDecrypting = loginState == LoginState.Decrypting;
  const forceValidate =
    loginState == LoginState.Decrypting ||
    loginState == LoginState.Cancelled ||
    loginState == LoginState.Failed;
  const isValid = !(
    loginState == LoginState.Cancelled || loginState == LoginState.Failed
  );
  let message = undefined;
  //getMessage(loginState);

  const passwordLabel = { id: 'site.login.passwordLabel', defaultMessage:'Password'};
  const decryptHeader = { id: 'site.login.decryptHeader', defaultMessage:'Logging into your account.'};
  const decryptIncorrectPwd = { id: 'site.login.decryptIncorrectPwd', defaultMessage:'Unlock failed: Please check your password and try again.'};
  //const decryptCancelled = { id: 'site.login.decryptCancelled', defaultMessage:'Unlock cancelled.'};
  //const decryptSuccess = { id: 'site.login.decryptSuccess', defaultMessage:'Unlock successful!  Please wait while we load your account info'};
  const decryptInProgress = { id: 'site.login.decryptInProgress', defaultMessage:'Please wait, We are {percentComplete}% done opening your account.'};

  switch (loginState) {
    //case LoginState.Cancelled:
    //  message = decryptCancelled;
    case LoginState.Failed:
      message = decryptIncorrectPwd;
  }

  return (
    <>
      <div className={styles.wrapper}>
        <Header as='h5'>
          <FormattedMessage 
              id="site.login.aboveTheTitle"
              defaultMessage="WELCOME BACK TO THE COIN"
              description="Text above the title for the login page"/>
        </Header>
        <Form>
          <div className={styles.titleLogin}>
          <Header as="h3">
            <FormattedMessage     
              id = "site.login.title"
              defaultMessage = "Log into"
              description="Main title for the login page before the account name"
              values={{
                walletName: account.name
              }}
            />
          </Header>
          <Header as="h3">
            { account.name }
          </Header>
          </div>
          <UxPassword
            uxChange={onPasswordChange}
            intlLabel={passwordLabel}
            placeholder="Wallet Password"
            message={message}
            isValid={isValid}
            forceValidate={forceValidate}
          />
          <Button onClick={onDecryptWallet} primary size='huge'> 
            &nbsp;&nbsp;&nbsp;&nbsp;
            <FormattedMessage 
                id="site.login.button"
                defaultMessage="Log In"
                description="Text of the button for the login page"/>
              &nbsp;&nbsp;&nbsp;&nbsp;
          </Button>

          <div className={styles.textAtTheBottom}>
            <FormattedMessage     
              id = "site.login.textAtTheBottom"
              defaultMessage = "Or select a different account from the account switcher. You can find it at the top menu."
              description="Text at the bottom for the login page before the account name"
            />
          </div>
        </Form>
        <ModalOperation
          cancelCallback={onCancel}
          isOpen={isDecrypting}
          header={decryptHeader}
          progressMessage={decryptInProgress}
          progressPercent={percentComplete}
        />
      </div>
      <img src={ illustrationPlant } />
    </>
  );
}
