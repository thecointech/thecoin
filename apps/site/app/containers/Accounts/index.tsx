import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { Account, RouterPath } from '@the-coin/shared/containers/Account';
import { AccountMap, AccountPageProps } from '@the-coin/shared/containers/Account/types';
import { Balance } from '@the-coin/shared/containers/Balance';
import { Redeem } from './Redeem';
import { Transfer } from './Transfer';
import { Settings } from './Settings';
import { Purchase } from './Purchase';
import { BillPayments } from './BillPayments';
import { selectActiveAccount } from './Selectors';

const AccountRoutes: RouterPath[] = [
  {
    name: 'Balance',
    urlFragment: '',
    creator: (routerProps: AccountPageProps) => ((props) => <Balance {...props} {...routerProps} />),
    exact: true,
  },
  {
    name: 'Transfer In',
    urlFragment: 'transferIn',
    creator: (routerProps: AccountPageProps) => ((props) => <Purchase {...props} signer={routerProps.account.signer!} />),
  },
  {
    name: 'Transfer Out',
    urlFragment: 'redeem',
    creator: (routerProps: AccountPageProps) => ((props) => <Redeem {...props} account={routerProps.account} />),
  },
  {
    name: 'Transfer To',
    urlFragment: 'transfer',
    creator: (routerProps: AccountPageProps) => ((props) => <Transfer {...props} account={routerProps.account} />),
  },
  {
    name: 'Pay Bills',
    urlFragment: 'billPay',
    creator: (routerProps: AccountPageProps) => ((props) => <BillPayments {...props} account={routerProps.account} />),
  },
  {
    name: 'Settings',
    urlFragment: 'settings',
    creator: (routerProps: AccountPageProps) => ((props) => <Settings {...props} account={routerProps.account} />),
  },
];


type Props =
{
  accounts: AccountMap,
}  & RouteComponentProps;

export const Accounts = (props: Props) => {
    const activeAccount = selectActiveAccount();
    const { match } = props;
    const { url } = match;

    return (!activeAccount)
      ? <Redirect to="/addAccount" />
      : <Account account={activeAccount} accountMap={AccountRoutes} url={url} />;
}
