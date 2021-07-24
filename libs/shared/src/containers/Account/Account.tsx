import React, { useEffect, useCallback } from "react";
import { Route, Switch } from "react-router-dom";
import { RUrl } from '@thecointech/utilities/RUrl';
import { Login } from "../Login";
import { NotFoundPage } from "../NotFoundPage";
import { ApplicationBaseState } from "../../types";
import { useSidebar } from "../PageSidebar/actions";
import { SidebarMenuItem, FindItem } from "../PageSidebar/types";
import { ConnectWeb3 } from "./Web3";
import { IActions, AccountPageProps } from "./types";
import { useAccount, useAccountApi } from "./reducer";
import { isSigner, isWallet } from "@thecointech/signers";
import { NormalizeAddress } from "@thecointech/utilities";
import { SemanticICONS } from "semantic-ui-react";
import { DateTime } from "luxon";
import { defineMessages, FormattedMessage, MessageDescriptor, useIntl } from "react-intl";
import { AccountState } from '@thecointech/account';

export type PageCreator = (props: AccountPageProps) => (props: any) => React.ReactNode;
export type RouterPath = {
  name: MessageDescriptor;
  urlFragment?: string;
  creator?: PageCreator;
  exact?: boolean;
  icon?: SemanticICONS;
  header?: { avatar: string, primaryDescription: string, secondaryDescription: string | Element | JSX.Element };
  key?: string
};

interface Props {
  url: string;
  account: AccountState;
  accountMap: RouterPath[];
  addressMatch?: (address: string) => boolean;
}

const translate = defineMessages({
  waitingForWeb3:{
                id: "shared.account.account.waitingForWeb3",
                defaultMessage: "Connecting to your Web3 provider",
                description:"shared.account.account.waitingForWeb3: Message to display while waiting for user to complete Web3 connection" }});

export const Account = (props: Props) => {

  const { accountMap, account } = props;
  const { signer, address } = account;
  // Inject reducers/etc
  useAccount(account);
  const accountActions = useAccountApi(address);

  const sidebarCb = useCallback(
    (items: SidebarMenuItem[], _state: ApplicationBaseState) =>
      generateSubItems(props, items, _state),
    [props]
  );

  // Initialize sidebar
  const sidebar = useSidebar();
  useEffect(() => {
    sidebar.addGenerator(account.name, sidebarCb);
    return () => sidebar.removeGenerator(account.name);
  }, [account, sidebarCb])

  // prepare account for usage
  useEffect(() => {
    // Is this a remote account?
    if (isSigner(signer)) {
      if (!signer.provider)
        connectSigner(account, accountActions);
      else if (!account.contract) {
        // When a new account is added to account map,
        // it will be missing the contract.  Here we
        // enforce that connection for all cases
        accountActions.connect();
      }
    }

    // If we do not have todays history, update for last year
    // TODO: Implement account history properly.
    const now = DateTime.local();
    if (account.historyEnd?.day !== now.day) {
      accountActions.updateHistory(now.minus({ year: 1 }), now);
    }
  }, [signer])


  if (isWallet(signer)) {
    if (!signer.privateKey)
      return (
        <Login account={account} />
      );
  } else {
    if (!signer.provider) {
      // Does not have a provider on-load
      return <FormattedMessage {...translate.waitingForWeb3} />
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
              key={item.key ?? targetUrl}
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
  const web3 = await ConnectWeb3();
  if ( web3?.address ) {
    if (NormalizeAddress(web3.address) !== address) {
      alert("Warning: cannot connect - remote account has a different address to the local store");
      return;
    }
    accountActions.setSigner(web3.signer);
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
    const intl = useIntl();
    const menuItems = accountMap.map(item => (
      {
        link: {
          name: intl.formatMessage(item.name),
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
