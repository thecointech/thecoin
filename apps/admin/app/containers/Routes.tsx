import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { TheCoin, AccountName as TheCoinName } from 'containers/TheCoinAccount'
import { BrokerCAD, AccountName as BrokerName } from 'containers/BrokerCAD'
import { NotFoundPage } from './NotFoundPage';
import {RUrl} from '@the-coin/utilities';
import { PageSidebar } from '@the-coin/shared';

const ConstantSidebarItems: PageSidebar.SidebarMenuItem[] = 
[
	{
		link: {
			name: "TheCoin",
			to: new RUrl("/" + TheCoinName)
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
			to: new RUrl("/" + BrokerName)
		}
	}
];

const generateSidebarItems = () : PageSidebar.SidebarMenuItem[] => 
	PageSidebar.MapMenuItems(ConstantSidebarItems, "/");

const SIDEBAR_KEY = "RootItems"
  
export const Routes = () => {

  const sidebar = PageSidebar.useSidebar();
  React.useEffect(() => {
    sidebar.addGenerator(SIDEBAR_KEY, generateSidebarItems);
    return () => sidebar.removeGenerator(SIDEBAR_KEY);
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