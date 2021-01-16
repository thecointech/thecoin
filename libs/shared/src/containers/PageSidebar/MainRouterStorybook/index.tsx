import { RUrl } from '@the-coin/utilities/RUrl';
import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useSidebar } from '../actions';
import { MapMenuItems, SidebarMenuItem } from '../types';

export const MainRouterStorybook = () => {
  
  const ConstantSidebarItems: SidebarMenuItem[] = 
  [
    {
      link: {
        to: false,
        name: 'Divider',
      },
    },
    {
      link: {
        name: "Home",
        to: new RUrl("/")
      }
    },
    {
      link: {
        name: "Top up Balance",
        to: new RUrl("/broker")
      }
    },
    {
      link: {
        name: "Make a payment",
        to: new RUrl("/thecoin")
      }
    },
    {
      link: {
        name: "BrokerCAD",
        to: new RUrl("/broker")
      }
    }
  ];
  
  const generateSidebarItems = () : SidebarMenuItem[] => 
    MapMenuItems(ConstantSidebarItems, "/");
  
    const SIDEBAR_KEY = "RootItems"
    
    const sidebar = useSidebar();
    React.useEffect(() => {
      sidebar.addGenerator(SIDEBAR_KEY, generateSidebarItems);
      return () => sidebar.removeGenerator(SIDEBAR_KEY);
    }, [sidebar])


  return (
    <Switch>
      <Route path="/" exact content="ghjghjghjkghjkghjk1" />
      <Route path="/newsletter/confirm" exact content="2"/>
    </Switch>
  )
}
