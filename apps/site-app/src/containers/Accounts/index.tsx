import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { Account, RouterPath } from '@thecointech/shared/containers/Account';
import { AccountPageProps } from '@thecointech/shared/containers/Account/types';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { HomePage } from '../HomePage';
import { MakePayments } from 'containers/MakePayments';
import { Topup } from 'containers/TopUp';
import { Settings } from 'containers/Settings';
import { getAvatarsLink } from '@thecointech/shared/components/Avatars';


const home = { id:"app.accounts.sidebar.home",
                defaultMessage:"Overview",
                description:"Title for the Home entry in the menu"};
const transferin = { id:"app.accounts.sidebar.transferin",
                  defaultMessage:"Top up balance",
                  description:"Title for the Top up balance entry in the menu"};
const makepayments = {  id:"app.accounts.sidebar.makepayments",
                    defaultMessage:"Make payments",
                    description:"Title for the Make payments entry in the menu"};
const settings = {  id:"app.accounts.sidebar.settings",
                    defaultMessage:"Settings",
                    description:"Title for the Settings entry in the menu"};
const contact = {  id:"app.accounts.sidebar.contact",
                    defaultMessage:"Contact Us",
                    description:"Title for the Contact Us entry in the menu"};
const profile = {  id:"app.accounts.sidebar.profile",
                    defaultMessage:"Profile",
                    description:"Title for the Profile entry in the menu"};

const AccountRoutes: RouterPath[] = [
  {
    name: home,
    urlFragment: '/',
    creator: (routerProps: AccountPageProps) => ((props) => <HomePage {...props} {...routerProps} />),
    exact: true,
    icon: "home",
  },
  {
    name: transferin,
    urlFragment: 'transferIn',
    creator: (routerProps: AccountPageProps) => ((props) => <Topup {...props} {...routerProps} />),
    icon: "arrow circle up",
  },
  {
    name: makepayments,
    urlFragment: 'makepayments',
    creator: (routerProps: AccountPageProps) => (() => <MakePayments {...routerProps} />),
    icon: "arrow circle right",
  },
  {
    name: settings,
    urlFragment: 'settings',
    creator: () => (() => <Settings />),
    icon: "setting",
  },
  {
    name: contact,
    urlFragment: 'contact',
    creator: () => (() => <Settings />),
    icon: "envelope outline",
  },
];



export const Accounts = (props: RouteComponentProps) => {
  const activeAccount = useActiveAccount();
  const { match } = props;
  const { url } = match;

  

  if (activeAccount){
    if (!AccountRoutes[0].header){
      AccountRoutes.unshift(
        {
          name: profile,
          header: { avatar: getAvatarsLink("14"),
                    primaryDescription: activeAccount?.name ?? "Unknown",
                    secondaryDescription: "Description2" },
      });
    } else {
      AccountRoutes[0].header = {
        avatar: getAvatarsLink("14"),
        primaryDescription: activeAccount?.name ?? "Unknown",
        secondaryDescription: "Description2" };
    }
  }

  return (!activeAccount)
    ? <Redirect to="/addAccount" />
    : <Account account={activeAccount} accountMap={AccountRoutes} url={url} />;
}
