import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { Account, RouterPath } from '@the-coin/shared/containers/Account';
import { AccountPageProps } from '@the-coin/shared/containers/Account/types';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import { HomePage } from '../HomePage';
import { MakePayments } from 'containers/MakePayments';
import { Topup } from 'containers/TopUp';
import { Settings } from 'containers/Settings';

const AccountRoutes: RouterPath[] = [
  {
    name: 'Home',
    urlFragment: '/',
    creator: (routerProps: AccountPageProps) => ((props) => <HomePage {...props} {...routerProps} />),
    exact: true,
    icon: "home",
  },
  {
    name: 'Top up balance',
    urlFragment: 'transferIn',
    creator: (routerProps: AccountPageProps) => ((props) => <Topup {...props} {...routerProps} />),
    icon: "arrow circle up",
  },
  {
    name: 'Make payments',
    urlFragment: 'makepayments',
    creator: (routerProps: AccountPageProps) => ((props) => <MakePayments {...props} {...routerProps} />),
    icon: "arrow circle right",
  },
  {
    name: 'Settings',
    urlFragment: 'settings',
    creator: () => (() => <Settings />),
    icon: "setting",
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
