import React, { useEffect, useCallback } from "react";
import { Route, Switch } from "react-router-dom";
import { RUrl } from '@the-coin/utilities/RUrl';
import { Login } from "../Login";
import { NotFoundPage } from "../NotFoundPage";
import { ApplicationBaseState } from "types";
import { useSidebar } from "../PageSidebar/actions";
import { SidebarMenuItem, FindItem } from "../PageSidebar/types";
import { ConnectWeb3 } from "./Web3";
import { AccountState, IActions, AccountPageProps } from "./types";
import { useAccountApi } from "./reducer";
import { isSigner, isWallet } from "../../SignerIdent";
import { NormalizeAddress } from "@the-coin/utilities";
import { SemanticICONS } from "semantic-ui-react";
import { DateTime } from "luxon";

export type PageCreator = (props: AccountPageProps) => (props: any) => React.ReactNode;
export type RouterPath = {
  name: string;
  urlFragment?: string;
  creator?: PageCreator;
  exact?: boolean;
  icon?: SemanticICONS;
  header?: { avatar: string, primaryDescription: string, secondaryDescription: string };
};

interface Props {
  url: string;
  account: AccountState;
  accountMap: RouterPath[];
  addressMatch?: (address: string) => boolean;
}

export const Account = (props: Props) => {

  const { accountMap, account } = props;
  const { signer, address } = account;
  const accountActions = useAccountApi(address);

  const sidebarCb = useCallback(
    (items: SidebarMenuItem[], _state: ApplicationBaseState) =>
      generateSubItems(props, items, _state),
    [props]
  );

  const sidebar = useSidebar();
  useEffect(() => {
    sidebar.addGenerator(account.name, sidebarCb);

    // Is this a remote account?
    if (isSigner(signer)) {
      if (!signer.provider)
        connectSigner(account, accountActions);
      else if (!account.contract) {
        // When a new account is added to account map,
        // it will be missing the contract.  Here we
        // enforce that connection for all cases
        accountActions.setSigner(signer);
      }
    }

    // If we do not have todays history, update for last year
    // TODO: Implement account history properly.
    const now = DateTime.local();
    if (account.historyEnd?.day != now.day) {
      accountActions.updateHistory(now.minus({year: 1}), now);
    }

    return () => sidebar.removeGenerator(account.name);
  }, [account, signer, sidebarCb])


  if (isWallet(signer)) {
    if (!signer.privateKey)
      return (
        <Login account={account} />
      );
  } else {
    if (!signer.provider) {
      // Does not have a provider on-load
      return <div>Connecting to your Web3 provider</div>;
    }
  }

  const accountArgs: AccountPageProps = {
    account: account,
    actions: accountActions
  };
  return (
    <Switch>
      {accountMap.map(item => {
        if (item.urlFragment && item.creator){
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
        } else {
          return "";
        }
      })}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

const connectSigner = async (accountState: AccountState, accountActions: IActions) => {
  const { address } = accountState;
  const theSigner = await ConnectWeb3();
  if ( theSigner?.address ) {
    if (NormalizeAddress(theSigner.address) !== address) {
      alert("Warning: cannot connect - remote account has a different address to the local store");
      return;
    }
    accountActions.setSigner(theSigner);
  }
}

const BuildLink = (item: RouterPath, url: string) => {
  if (item.urlFragment){
    return new RUrl(url, item.urlFragment);
  }
  return false;
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
          to: BuildLink(item, url)  ? BuildLink(item, url)  : false,
          icon: item.icon,
          header: item.header,
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
