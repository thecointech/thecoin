import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";
import { Button, Form, Header } from "semantic-ui-react";

import { UxPassword } from "../../components/UxPassword";
import { ModalOperation } from "../ModalOperation";

import { useState, useCallback } from "react";
import { isWallet } from "@thecointech/utilities/SignerIdent";
import { useAccountApi } from "../Account/reducer";

import styles from "./styles.module.less";
import { AccountState } from '@thecointech/account';

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


const aboveTheTitle = { id:"shared.login.aboveTheTitle",
                        defaultMessage:"WELCOME BACK TO THE COIN",
                        description:"Title above the main Title for the create account form page"};
const title = { id:"shared.login.title",
                defaultMessage:"Log into",
                description:"Title for the create account form page"};
const button = { id:"shared.login.button",
                defaultMessage:"Log In",
                description:"Text of the button for the login page"};
const textAtTheBottom = { id:"shared.login.textAtTheBottom",
                          defaultMessage:"Or select a different account from the account switcher. You can find it at the top menu.",
                          description:"Text at the bottom for the login page before the account name"};
const placeholderPassword = { id: 'shared.login.placeholder.wallet',
                              defaultMessage:'Wallet Password',
                              description:"PLaceholder for the Passford field in the create account form"};

const passwordLabel = { id: 'shared.login.passwordLabel', defaultMessage:'Password'};
const decryptHeader = { id: 'shared.login.decryptHeader', defaultMessage:'Logging into your account.'};
const decryptIncorrectPwd = { id: 'shared.login.decryptIncorrectPwd', defaultMessage:'Unlock failed: Please check your password and try again.'};
//const decryptCancelled = { id: 'shared.login.decryptCancelled', defaultMessage:'Unlock cancelled.'};
//const decryptSuccess = { id: 'shared.login.decryptSuccess', defaultMessage:'Unlock successful!  Please wait while we load your account info'};
const decryptInProgress = { id: 'shared.login.decryptInProgress', defaultMessage:'Please wait, We are {percentComplete}% done opening your account.'};


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
    history.push('/');
  }

  const intl = useIntl();
  const placeholderPasswordTranslated = intl.formatMessage(placeholderPassword);

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


  switch (loginState) {
    //case LoginState.Cancelled:
    //  message = decryptCancelled;
    case LoginState.Failed:
      message = decryptIncorrectPwd;
  }

  return (
    <>
      <div className={`${styles.wrapper} x6spaceAfter`}>
        <Header as='h5' className={ `x4spaceBefore` }>
          <FormattedMessage {...aboveTheTitle}/>
        </Header>
        <Header as="h2" className={ `x4spaceBefore` }>
          <FormattedMessage {...title} /> <br />
            { account.name }
        </Header>
        <Form id={styles.loginForm}>
          <UxPassword
            uxChange={onPasswordChange}
            intlLabel={passwordLabel}
            placeholder={placeholderPasswordTranslated}
            message={message}
            isValid={isValid}
            forceValidate={forceValidate}
          />
          <Button primary onClick={onDecryptWallet} size='medium' className={ `x4spaceBefore` } >
            &nbsp;&nbsp;&nbsp;&nbsp;
            <FormattedMessage {...button} />
              &nbsp;&nbsp;&nbsp;&nbsp;
          </Button>

          <div className={ `x10spaceBefore x8spaceAfter` } >
            <FormattedMessage {...textAtTheBottom} />
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
    </>
  );
}
