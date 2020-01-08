import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { TheCoin } from 'containers/TheCoinAccount'
import { BrokerCAD, AccountName as BrokerName } from 'containers/BrokerCAD'
import { NotFoundPage } from './NotFoundPage';

import { Dispatch } from '@the-coin/shared/containers/PageSidebar/actions';
import { SidebarMenuItem, MapMenuItems } from '@the-coin/shared/containers/PageSidebar/types';
import { useDispatch } from 'react-redux';

const ConstantSidebarItems: SidebarMenuItem[] = 
[
	{
		link: {
			name: "TheCoin",
			to: TheCoin.AccountName
		}
	},
	{
		link: {
		  to: false,
		  name: 'Divider',
		},
	},
	{
		link: {
			name: "BrokerCAD",
			to: BrokerName
		}
	}
];

const generateSidebarItems = () : SidebarMenuItem[] => 
  MapMenuItems(ConstantSidebarItems, "/");
  
export const Routes = () => {

  const dispatch = useDispatch();
  React.useEffect(() => {
    const sidebar = Dispatch(dispatch)
    sidebar.setRootGenerator(generateSidebarItems);

    return () => sidebar.setRootGenerator(null);
  }, [dispatch])

  const brokerCad = `/${BrokerName}`;
  const theCoin = `/${TheCoin.AccountName}`;
  return (
    <Switch>
      <Route path={brokerCad} key={brokerCad} component={BrokerCAD} />
      <Route path={theCoin} key={theCoin} component={TheCoin} />
      <Route key="default" component={NotFoundPage} />
    </Switch>
  )
}