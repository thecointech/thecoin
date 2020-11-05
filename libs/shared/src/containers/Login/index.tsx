import * as React from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import { Button, Form, Header } from "semantic-ui-react";

import { UxPassword } from "../../components/UxPassword";
import { ModalOperation } from "../ModalOperation";
import messages from "./messages";

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
  const message = getMessage(loginState);

  //let intl = useIntl();
  //const titleMsg = intl.formatMessage({ id: 'site.AccountSwitcher.login', defaultMessage:'LOG IN'});

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
            intlLabel={messages.labelPassword}
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
          header={messages.decryptHeader}
          progressMessage={messages.decryptInProgress}
          progressPercent={percentComplete}
        />
      </div>
      <img src={ illustrationPlant } />
    </>
  );
}


function getMessage(state: LoginState) {
  switch (state) {
    case LoginState.Cancelled:
      return messages.decryptCancelled;
    case LoginState.Failed:
      return messages.decryptIncorrectPwd;
  }
  return undefined;
}

// decryptWalletCallback(percent: number): boolean {
//   if (this.state.cancelDecrypting) {
//     this.setState({
//       state: LoginState.Cancelled,
//       cancelDecrypting: false
//     });
//     return false;
//   } else if (percent === -1) {
//     // Invalid password?
//     if (!this.state.cancelDecrypting) {
//       this.setState({
//         state: LoginState.Failed
//       });
//     }
//     return false;
//   } else if (percent === 100) {
//     this.setState({
//       state: LoginState.Complete,
//       cancelDecrypting: false
//     });
//   } else {
//     this.setState({
//       percentComplete: percent
//     });
//   }
//   return true;
// }


// class Login extends React.PureComponent<Props, State, null> {
//   state = initialState;

//   constructor(props: Props) {
//     super(props);

//     this.onPasswordChange = this.onPasswordChange.bind(this);
//     this.decryptWallet = this.decryptWallet.bind(this);
//     this.decryptWalletCallback = this.decryptWalletCallback.bind(this);
//     this.onCancelLogin = this.onCancelLogin.bind(this);
//   }

//   onPasswordChange(value: string): void {
//     this.setState({
//       password: value
//     });
//     // If we are in a failed state, reset state with new keystroke
//     const { state } = this.state;
//     if (state == LoginState.Cancelled || state == LoginState.Failed) {
//       this.setState({
//         state: LoginState.Entry
//       });
//     }
//   }

//   decryptWalletCallback(percent: number): boolean {
//     if (this.state.cancelDecrypting) {
//       this.setState({
//         state: LoginState.Cancelled,
//         cancelDecrypting: false
//       });
//       return false;
//     } else if (percent === -1) {
//       // Invalid password?
//       if (!this.state.cancelDecrypting) {
//         this.setState({
//           state: LoginState.Failed
//         });
//       }
//       return false;
//     } else if (percent === 100) {
//       this.setState({
//         state: LoginState.Complete,
//         cancelDecrypting: false
//       });
//     } else {
//       this.setState({
//         percentComplete: percent
//       });
//     }
//     return true;
//   }

//   onCancelLogin() {
//     this.setState({
//       cancelDecrypting: true
//     });
//   }

//   decryptWallet(e: React.MouseEvent<HTMLElement>) {
//     if (e) e.preventDefault();

//     const { wallet, walletName } = this.props;
//     const { password } = this.state;

//     if (wallet.privateKey) {
//       throw `Cannot decrypt ${walletName} because it is already decrypted`;
//     }

//     this.setState({
//       state: LoginState.Decrypting
//     });

//     this.props.decrypt(password, this.decryptWalletCallback);
//   }

//   getMessage(state: LoginState) {
//     switch (state) {
//       case LoginState.Cancelled:
//         return messages.decryptCancelled;
//       case LoginState.Failed:
//         return messages.decryptIncorrectPwd;
//     }
//     return undefined;
//   }

//   render() {
//     const { wallet, walletName } = this.props;
//     if (wallet && wallet.privateKey) {
//       return <Redirect to={`/accounts/${walletName}`} />;
//     }
//     const { state } = this.state;

//     const isDecrypting = state == LoginState.Decrypting;
//     const showState =
//       state == LoginState.Decrypting ||
//       state == LoginState.Cancelled ||
//       state == LoginState.Failed;
//     const isValid = !(
//       state == LoginState.Cancelled || state == LoginState.Failed
//     );
//     const message = this.getMessage(state);

//     return (
//       <React.Fragment>
//         <div className={styles.wrapper}>
//           <Form id="formCreateAccountStep1">
//             <Header as="h1">
//               <Header.Content>
//                 <FormattedMessage
//                   {...messages.header}
//                   values={{
//                     walletName: this.props.walletName
//                   }}
//                 />
//               </Header.Content>
//               <Header.Subheader>
//                 <FormattedMessage {...messages.subHeader} />
//               </Header.Subheader>
//             </Header>
//             <UxPassword
//               uxChange={this.onPasswordChange}
//               intlLabel={messages.labelPassword}
//               placeholder="Wallet Password"
//               message={message}
//               isValid={isValid}
//               forceValidate={showState}
//             />
//             <Button onClick={this.decryptWallet}>
//               <FormattedMessage {...messages.buttonLogin} />
//             </Button>
//           </Form>
//           <ModalOperation
//             cancelCallback={this.onCancelLogin}
//             isOpen={isDecrypting}
//             header={messages.decryptHeader}
//             progressMessage={messages.decryptInProgress}
//             progressPercent={this.state.percentComplete}
//           />
//         </div>
//       </React.Fragment>
//     );
//   }
// }
