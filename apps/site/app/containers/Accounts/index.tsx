import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import * as Sidebar from '@the-coin/shared/containers/PageSidebar/actions';
import { Account, RouterPath, AccountProps } from '@the-coin/shared/containers/Account';
import { AccountMap } from '@the-coin/shared/containers/Account/types';
import { Balance } from '@the-coin/shared/containers/Balance';
import { Redeem } from './Redeem';
import { Transfer } from './Transfer';
import { Settings } from './Settings';
import { Purchase } from './Purchase';
import { BillPayments } from './BillPayments';
import { selectActiveAccount } from './Selectors';

interface OwnProps {}

type Props = OwnProps &
{
  Sidebar: Sidebar.DispatchProps,
  accounts: AccountMap,
}  & RouteComponentProps;

const AccountRoutes: RouterPath[] = [
  {
    name: 'Balance',
    urlFragment: '',
    creator: (routerProps: AccountProps) => ((props) => <Balance {...props} {...routerProps} />),
    exact: true,
  },
  {
    name: 'Transfer In',
    urlFragment: 'transferIn',
    creator: (routerProps: AccountProps) => ((props) => <Purchase {...props} signer={routerProps.account.signer!} />),
  },
  {
    name: 'Transfer Out',
    urlFragment: 'redeem',
    creator: (routerProps: AccountProps) => ((props) => <Redeem {...props} account={routerProps.account} />),
  },
  {
    name: 'Transfer To',
    urlFragment: 'transfer',
    creator: (routerProps: AccountProps) => ((props) => <Transfer {...props} account={routerProps.account} />),
  },
  {
    name: 'Pay Bills',
    urlFragment: 'billPay',
    creator: (routerProps: AccountProps) => ((props) => <BillPayments {...props} account={routerProps.account} />),
  },
  {
    name: 'Settings',
    urlFragment: 'settings',
    creator: (routerProps: AccountProps) => ((props) => <Settings {...props} account={routerProps.account} />),
  },
];

export const Accounts = (props: Props) => {
    const activeAccount = selectActiveAccount();
    if (!activeAccount) {
      return <Redirect to="/addAccount" />
    }

    const { match } = props;
    const { url } = match;
    return <Account accountName={activeAccount} accountMap={AccountRoutes} url={url} />;
}
