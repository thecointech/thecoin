import React, { useEffect, useCallback } from "react";
import { Route, Switch } from "react-router-dom";
import { Login } from "../Login";
import { NotFoundPage } from "../NotFoundPage";
import { ApplicationBaseState } from "../../types";
import { useSidebar } from "../PageSidebar/actions";
import { SidebarMenuItem, FindItem } from "../PageSidebar/types";
import { ConnectWeb3 } from "./Web3";
import { AccountState, IActions, AccountPageProps } from "./types";
import { useAccount } from "./reducer";
import { isWallet } from "./storageSync";
import {RUrl} from '@the-coin/utilities/RUrl';

export type PageCreator = (props: AccountPageProps) => (props: any) => React.ReactNode;
export type RouterPath = {
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
  const accountActions = useAccount(account.name);

  const sidebarCb = useCallback(
    (items: SidebarMenuItem[], _state: ApplicationBaseState) =>
      generateSubItems(props, items, _state),
    [props]
  );

  const sidebar = useSidebar();
  useEffect(() => {
    sidebar.addGenerator(account.name, sidebarCb);

    // Is this a remote account?
    if (signer && !isWallet(signer) && !signer.provider) {
      connectSigner(account, accountActions);
    }
    return () => sidebar.removeGenerator(account.name);
  }, [account, signer, sidebarCb])


  if (signer === null) {
    debugger;
    return <div>Critical Error: Given account does not have a signer - please contact <a href="mailto:support@thecoin.io">support</a></div>;
  } else {
    if (isWallet(signer)) {
      if (!signer.privateKey)
        return (
          <Login
            wallet={signer}
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

  const accountArgs: AccountPageProps = {
    account: account,
    actions: accountActions
  };

  return (
    <Switch>
      {accountMap.map(item => {
        const component = item.creator(accountArgs);
        const targetUrl = BuildLink(item, props.url).toString();
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

const connectSigner = async (accountState: AccountState, accountActions: IActions) => {
  const { signer, name } = accountState;
  const theSigner = await ConnectWeb3();
  if (signer && theSigner) {
    if (theSigner.address != signer.address) {
      return;
    }
    accountActions.setSigner(name, theSigner);
  }
}

const BuildLink = (item: RouterPath, url: string) => 
  new RUrl(url, item.urlFragment);

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

//export { RouterPath, PageCreator, AccountPageProps as AccountProps };
