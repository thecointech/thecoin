import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";

import { Login } from "../../containers/Login";
import { NotFoundPage } from "../../containers/NotFoundPage";

import { ApplicationBaseState } from "../../types";
import * as Sidebar from "../PageSidebar/actions";
import { SidebarMenuItem, FindItem } from "../PageSidebar/types";

import { ConnectWeb3 } from "./Web3";
import { AccountState } from "./types";
import { getAccountReducer } from "./reducer";
import * as AccountActions from "./actions";
import { AsWallet } from "./storageSync";


interface AccountProps {
  account: AccountState;
  dispatch: AccountActions.DispatchProps;
}
type PageCreator = (props: AccountProps) => (props: any) => React.ReactNode;
type RouterPath = {
  name: string;
  urlFragment: string;
  creator: PageCreator;
  exact?: boolean;
};

interface Props {
  url: string;
  account: AccountState;
  accountMap: RouterPath[];
  addressMatch?: (address: string) => boolean;
}

export const Account = (props: Props) => {

  const { accountMap, account } = props;
  const { signer } = account;
  const dispatch = useDispatch();
  const { actions } = getAccountReducer(account.name);
  const accountActions = AccountActions.BindActions(actions, dispatch);
  
  const sidebarCb = useCallback(
    (items: SidebarMenuItem[], _state: ApplicationBaseState) =>
      generateSubItems(props, items, _state),
    [props]
  );

  const sidebar = Sidebar.Dispatch(dispatch);
  useEffect(() => {
    sidebar.addGenerator(account.name, sidebarCb);

    // Is this a remote account?
    if (signer && !AsWallet(signer) && !signer.provider) {
      ConnectSigner(account, accountActions);
    }
    return () => sidebar.removeGenerator(account.name);
  }, [account, signer])


  if (signer === null) {
    debugger;
    return <div>Critical Error: Given account does not have a signer - please contact <a href="mailto:support@thecoin.io">support</a></div>;
  } else {
    const asWallet = AsWallet(signer);
    if (asWallet) {
      if (!asWallet.privateKey)
        return (
          <Login
            wallet={asWallet}
            walletName={account.name}
            decrypt={accountActions.decrypt}
          />
        );
    } else {
      if (!signer.provider) {
        // Does not have a provider on-load
        return <div>Connecting to your Web3 provider</div>;
      }
    }
  }

  const accountArgs = {
    account: account,
    dispatch: accountActions
  };

  return (
    <Switch>
      {accountMap.map(item => {
        const component = item.creator(accountArgs);
        const targetUrl = BuildLink(item, props.url);
        return (
          <Route
            path={targetUrl}
            key={targetUrl}
            render={component}
            exact={item.exact}
          />
        );
      })}
        <Route component={NotFoundPage} />
    </Switch>
  );
}

const ConnectSigner = async (accountState: AccountState, accountActions: AccountActions.DispatchProps) => {
  const { signer, name } = accountState;
  const theSigner = await ConnectWeb3();
  if (signer && theSigner) {
    if (theSigner.address != signer.address) {
      return;
    }
    accountActions.setSigner(name, theSigner);
  }
}

const BuildLink = (item: RouterPath, url: string) => {
  return url.endsWith("/")
    ? `${url}${item.urlFragment}`
    : `${url}/${item.urlFragment}`;
}

const generateSubItems = (
  props: Props,
  items: SidebarMenuItem[],
  _state: ApplicationBaseState
): SidebarMenuItem[] => {
  const { accountMap, account, url } = props;
  if (account.signer) {

    const menuItems = accountMap.map(item => (
      {
        link: {
          name: item.name,
          to: BuildLink(item, url)
        }
      })
    );
    const parent = FindItem(items, account.name);
    if (parent)
      parent.subItems = menuItems
    else
      items.push(...menuItems);
  }
  return items;
}

// Fancy-pants mapper returns the component with the appropriate reducer applied

// var __AccountMap: { [name: string]: React.ComponentType<OwnProps> } = {};
// function NamedAccount(props: OwnProps) {
//   const { accountName } = props;
//   if (!__AccountMap[accountName]) {
//     const accountDispatch = Account.buildMapDispatchToProps(accountName);
//     const mapDispatchToProps = function (dispatch: Dispatch) {
//       return {
//         dispatch: accountDispatch(dispatch),
//         ...Sidebar.Dispatch(dispatch)
//       };
//     };
//     const mapPropsToState = function (state: ApplicationBaseState) {
//       return {
//         account: createAccountSelector(accountName)(state)
//       };
//     };

//     __AccountMap[accountName] = injectSingleAccountReducer(accountName)(
//       connect(
//         mapPropsToState,
//         mapDispatchToProps
//       )(AccountClass)
//     );
//   }
//   return React.createElement(__AccountMap[accountName], props);
// }

export { RouterPath, PageCreator, AccountProps };
