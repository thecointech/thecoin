import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { TheCoin, AccountName as TheCoinName } from 'containers/TheCoinAccount'
import { BrokerCAD, AccountName as BrokerName } from 'containers/BrokerCAD'
import { NotFoundPage } from './NotFoundPage';

import { useSidebar } from '@the-coin/shared/containers/PageSidebar/actions';
import { SidebarMenuItem, MapMenuItems } from '@the-coin/shared/containers/PageSidebar/types';

const ConstantSidebarItems: SidebarMenuItem[] = 
[
	{
		link: {
			name: "TheCoin",
			to: TheCoinName
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

  const sidebar = useSidebar();
  React.useEffect(() => {
    sidebar.setRootGenerator(generateSidebarItems);
    return () => sidebar.setRootGenerator(null);
  }, [sidebar])

  const brokerCad = `/${BrokerName}`;
  const theCoin = `/${TheCoinName}`;
  return (
    <Switch>
      <Route path={brokerCad} key={brokerCad} component={BrokerCAD} />
      <Route path={theCoin} key={theCoin} component={TheCoin} />
      <Route key="default" component={NotFoundPage} />
    </Switch>
  )
}