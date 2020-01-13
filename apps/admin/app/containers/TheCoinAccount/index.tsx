import * as React from 'react';
import { Account, RouterPath, AccountProps } from '@the-coin/shared/containers/Account';
import { Balance } from '@the-coin/shared/containers/Balance';
import { Mint } from './Mint';
import { RouteComponentProps } from 'react-router';
import { Purchase } from 'containers/Purchase';
import { useSelector } from 'react-redux';
import { createAccountSelector } from '../../../../../libs/shared/src/containers/Account/selector';

//import { Balance } from 

interface OwnProps {
}
type Props = OwnProps & RouteComponentProps;

const AccountMap: RouterPath[] = [
  {
    name: "Balance",
    urlFragment: "",
    creator: (routerProps: AccountProps) => ((props: any) => <Balance {...props} {...routerProps} /> ), 
    exact: true
  },
  {
    name: "Minting",
    urlFragment: "mint",
    creator: (routerProps: AccountProps) => ((props: any) => <Mint {...props} updateBalance={routerProps.dispatch.updateBalance} {...routerProps.account} /> ), 
  },
  {
    name: "Complete Purchase",
    urlFragment: "purchase",
    creator: (routerProps: AccountProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />), 
  }
];

export const AccountName = "TheCoin";

export const TheCoin = (props: Props) =>  {
  const { url } = props.match;
  const brokerAccount = useSelector(createAccountSelector(AccountName))
  return <Account account={brokerAccount} accountMap={AccountMap} url={url} />
}