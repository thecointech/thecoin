import React, { useState } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import { Button, Form, Header } from "semantic-ui-react";
import { isLocal } from "@thecointech/signers";
import { AccountState } from '@thecointech/account';
import { UxPassword } from "../../components/UX/Password";
import { ValidateCB } from '../../components/UX/types';
import { ModalOperation } from "../ModalOperation";
import { Account } from "../Account/reducer";
import styles from "./styles.module.less";

export type Props = {
  account: AccountState;
}

const translate = defineMessages({
              aboveTheTitle : {
                id: "shared.login.aboveTheTitle",
                defaultMessage:"WELCOME BACK TO THE COIN",
                description:"shared.login.aboveTheTitle: Title above the main Title for the create account form page"},
              title : {
                id: "shared.login.title",
                defaultMessage:"Log into",
                description:"shared.login.title: Title for the create account form page"},
              button : {
                id: "shared.login.button",
                defaultMessage:"Log In",
                description:"shared.login.button: Text of the button for the login page"},
              textAtTheBottom : {
                id: "shared.login.textAtTheBottom",
                defaultMessage:"Or select a different account from the account switcher. You can find it at the top menu.",
                description:"shared.login.textAtTheBottom: Text at the bottom for the login page before the account name"},
              placeholderPassword : {
                id: "shared.login.placeholder.wallet",
                defaultMessage:'Wallet Password',
                description:"shared.login.placeholder.wallet: PLaceholder for the Passford field in the create account form"},
              passwordLabel : {
                id: "shared.login.passwordLabel",
                defaultMessage:'Password',
                description:"shared.login.passwordLabel"},
              decryptHeader : {
                id: "shared.login.decryptHeader",
                defaultMessage:'Logging into your account.',
                description:"shared.login.decryptHeader"},
              decryptNoPwd : {
                  defaultMessage:'Please enter your password',
                  description:"Error when logging in without password"},
              decryptIncorrectPwd : {
                id: "shared.login.decryptIncorrectPwd",
                defaultMessage:'Unlock failed: Please check your password and try again.',
                description:"shared.login.decryptIncorrectPwd"},
              decryptInProgress : {
                id: "shared.login.decryptInProgress",
                defaultMessage:'Please wait, We are {percentComplete}% done opening your account.',
                description:"shared.login.decryptInProgress"}
});

//const decryptCancelled = { id: 'shared.login.decryptCancelled', defaultMessage:'Unlock cancelled.'};
//const decryptSuccess = { id: 'shared.login.decryptSuccess', defaultMessage:'Unlock successful!  Please wait while we load your account info'};


let __cancel = false;
const onCancel = () => __cancel = true;
const badPwdValid = (pwd: string) => {
  return (value: string) =>
    (value === pwd)
      ? translate.decryptIncorrectPwd
      : null;
}

export const Login = (props: Props) => {
  const [password, setPassword] = useState<MaybeString>();
  const [percentComplete, setPercentComplete] = useState(-1);
  const [validateFn, setValidateFn] = useState<ValidateCB|undefined>();
  const [forceValidate, setForceValidate] = useState(false);

  const { account } = props;
  const { signer, address }= account;
  const accountApi = Account(address).useApi();
  const history = useHistory();

  if (!isLocal(signer) || signer.privateKey) {
    history.push('/');
  }

  ////////////////////////////////
  const onDecryptWallet = (e: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    __cancel = false;
    // Reset validation to be always valid
    setValidateFn(undefined);
    setForceValidate(true);
    if (password?.length) {
      setPercentComplete(0);
      accountApi.decrypt(password, decryptWalletCallback);
    }
  }

  ////////////////////////////////
  const decryptWalletCallback = (percent: number): boolean => {
    if (__cancel) {
      setValidateFn(undefined);
      setPercentComplete(-1);
      return false;
    }
    else if (percent === -1) {
      // Invalid password?
      setPercentComplete(-1);
      if (!__cancel) {
        setValidateFn(() => badPwdValid(password!));
        // Force validation update by toggling forceValidate
        setForceValidate(v => !v);
        setForceValidate(v => !v);
      }
      return false;
    }
    else {
      setPercentComplete(percent);
    }
    return true;
  }

  ////////////////////////////////
  const isDecrypting = percentComplete >= 0 && percentComplete < 100;
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
            onValue={setPassword}
            onValidate={validateFn}
            intlLabel={translate.passwordLabel}
            placeholder={translate.placeholderPassword}
            tooltip={translate.decryptNoPwd}
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
