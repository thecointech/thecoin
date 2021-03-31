import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { Account, RouterPath } from '@thecointech/shared/containers/Account';
import { AccountPageProps } from '@thecointech/shared/containers/Account/types';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { HomePage } from '../HomePage';
import { MakePayments } from 'containers/MakePayments';
import { Topup } from 'containers/TopUp';
import { Settings } from 'containers/Settings';
import { useIntl } from 'react-intl';

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

const AccountRoutes: RouterPath[] = [
  {
    name: (useIntl()).formatMessage(home),
    urlFragment: '/',
    creator: (routerProps: AccountPageProps) => ((props) => <HomePage {...props} {...routerProps} />),
    exact: true,
    icon: "home",
  },
  {
    name: (useIntl()).formatMessage(transferin),
    urlFragment: 'transferIn',
    creator: (routerProps: AccountPageProps) => ((props) => <Topup {...props} {...routerProps} />),
    icon: "arrow circle up",
  },
  {
    name: (useIntl()).formatMessage(makepayments),
    urlFragment: 'makepayments',
    creator: (routerProps: AccountPageProps) => (() => <MakePayments {...routerProps} />),
    icon: "arrow circle right",
  },
  {
    name: (useIntl()).formatMessage(settings),
    urlFragment: 'settings',
    creator: () => (() => <Settings />),
    icon: "setting",
  },
  {
    name: (useIntl()).formatMessage(contact),
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
          name: 'Profile',
          header: { avatar: "https://sadanduseless.b-cdn.net/wp-content/uploads/2019/07/yawning-rabbits4.jpg",
                    primaryDescription: activeAccount?.name ?? "Unknown",
                    secondaryDescription: "Description2" },
      });
    } else {
      AccountRoutes[0].header = {
        avatar: "http://cdn.akc.org/content/hero/pyr_pup_hero.jpg",
        primaryDescription: activeAccount?.name ?? "Unknown",
        secondaryDescription: "Description2" };
    }
  }

  return (!activeAccount)
    ? <Redirect to="/addAccount" />
    : <Account account={activeAccount} accountMap={AccountRoutes} url={url} />;
}
