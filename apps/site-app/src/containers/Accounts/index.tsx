import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { Account, RouterPath } from '@the-coin/shared/containers/Account';
import { AccountPageProps } from '@the-coin/shared/containers/Account/types';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';
import { HomePage } from '../HomePage';
import { Redeem } from './Redeem';
import { Transfer } from './Transfer';
import { Settings } from './Settings';
import { Purchase } from './Purchase';
import { BillPayments } from './BillPayments';

const AccountRoutes: RouterPath[] = [
  {
    name: 'Home',
    urlFragment: '/',
    creator: (routerProps: AccountPageProps) => ((props) => <HomePage {...props} {...routerProps} />),
    exact: true,
    icon: "home",
  },
  {
    name: 'Deposit Instructions',
    urlFragment: 'transferIn',
    creator: (routerProps: AccountPageProps) => ((props) => <Purchase {...props} signer={routerProps.account.signer!} />),
    icon: "arrow circle up",
  },
  {
    name: 'Send an e-Transfer',
    urlFragment: 'redeem',
    creator: (routerProps: AccountPageProps) => ((props) => <Redeem {...props} account={routerProps.account} />),
    icon: "arrow circle right",
  },
  {
    name: 'Transfer',
    urlFragment: 'transfer',
    creator: (routerProps: AccountPageProps) => ((props) => <Transfer {...props} account={routerProps.account} />),
    icon: "arrow circle right",
  },
  {
    name: 'Pay Bills',
    urlFragment: 'billPay',
    creator: (routerProps: AccountPageProps) => ((props) => <BillPayments {...props} account={routerProps.account} />),
    icon: "arrow circle right",
  },
  {
    name: 'Settings',
    urlFragment: 'settings',
    creator: (routerProps: AccountPageProps) => ((props) => <Settings {...props} account={routerProps.account} />),
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
                    primaryDescription: activeAccount?.name ? activeAccount?.name : "Unknown", 
                    secondaryDescription: "Description2" },
      });
    } else {
      AccountRoutes[0].header = { 
        avatar: "http://cdn.akc.org/content/hero/pyr_pup_hero.jpg", 
        primaryDescription: activeAccount?.name ? activeAccount?.name : "Unknown", 
        secondaryDescription: "Description2" };
    }
  }

  return (!activeAccount)
    ? <Redirect to="/addAccount" />
    : <Account account={activeAccount} accountMap={AccountRoutes} url={url} />;
}
