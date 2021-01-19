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
        to: new RUrl("/"),
        icon: "home",
      }
    },
    {
      link: {
        name: "Top up Balance",
        to: new RUrl("/broker"),
        icon: "arrow circle up",
      }
    },
    {
      link: {
        name: "Make a payment",
        to: new RUrl("/thecoin"),
        icon: "arrow circle right",
      }
    },
    {
      link: {
        name: "Settings",
        to: new RUrl("/brokersss"),
        icon: "setting",
      }
    },
    {
      link: {
        name: "Help",
        to: new RUrl("/brokersss"),
        icon: "life ring",
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
