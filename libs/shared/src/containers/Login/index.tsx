import * as React from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";
import { Button, Form, Header } from "semantic-ui-react";

import { UxPassword } from "../../components/UxPassword";
import { ModalOperation } from "../ModalOperation";

import { useState, useCallback } from "react";
import { isWallet } from "../../SignerIdent";
import { AccountState } from "../Account/types";
import { useAccountApi } from "../Account/reducer";

import styles from "./styles.module.less";

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


const translate = defineMessages({  
              aboveTheTitle : { defaultMessage:"WELCOME BACK TO THE COIN",
                                description:"shared.login.aboveTheTitle: Title above the main Title for the create account form page"},
              title : { defaultMessage:"Log into",
                        description:"shared.login.title: Title for the create account form page"},
              button : { defaultMessage:"Log In",
                          description:"shared.login.button: Text of the button for the login page"},                  
              textAtTheBottom : { defaultMessage:"Or select a different account from the account switcher. You can find it at the top menu.",
                                  description:"shared.login.textAtTheBottom: Text at the bottom for the login page before the account name"},
              placeholderPassword : { defaultMessage:'Wallet Password',
                                      description:"shared.login.placeholder.wallet: PLaceholder for the Passford field in the create account form"},
              passwordLabel : { defaultMessage:'Password',
                                description:"shared.login.passwordLabel"},  
              decryptHeader : { defaultMessage:'Logging into your account.',
                                description:"shared.login.decryptHeader"},
              decryptIncorrectPwd : { defaultMessage:'Unlock failed: Please check your password and try again.',
                                      description:"shared.login.decryptIncorrectPwd"},
              decryptInProgress : { defaultMessage:'Please wait, We are {percentComplete}% done opening your account.',
                                    description:"shared.login.decryptInProgress"}      
});

//const decryptCancelled = { id: 'shared.login.decryptCancelled', defaultMessage:'Unlock cancelled.'};
//const decryptSuccess = { id: 'shared.login.decryptSuccess', defaultMessage:'Unlock successful!  Please wait while we load your account info'};


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
  const placeholderPasswordTranslated = intl.formatMessage(translate.placeholderPassword);

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
      message = translate.decryptIncorrectPwd;
  }

  return (
    <>
      <div className={`${styles.wrapper} x6spaceAfter`}>
        <Header as='h5' className={ `x4spaceBefore` }>
          <FormattedMessage {...translate.aboveTheTitle}/>
        </Header>
        <Header as="h2" className={ `x4spaceBefore` }>
          <FormattedMessage {...translate.title} /> <br />
            { account.name }
        </Header>
        <Form id={styles.loginForm}>
          <UxPassword
            uxChange={onPasswordChange}
            intlLabel={translate.passwordLabel}
            placeholder={placeholderPasswordTranslated}
            message={message}
            isValid={isValid}
            forceValidate={forceValidate}
          />
          <Button primary onClick={onDecryptWallet} size='medium' className={ `x4spaceBefore` } >
            &nbsp;&nbsp;&nbsp;&nbsp;
            <FormattedMessage {...translate.button} />
              &nbsp;&nbsp;&nbsp;&nbsp;
          </Button>

          <div className={ `x10spaceBefore x8spaceAfter` } >
            <FormattedMessage {...translate.textAtTheBottom} />
          </div>
        </Form>
        <ModalOperation
          cancelCallback={onCancel}
          isOpen={isDecrypting}
          header={translate.decryptHeader}
          progressMessage={translate.decryptInProgress}
          progressPercent={percentComplete}
        />
      </div>
    </>
  );
}
