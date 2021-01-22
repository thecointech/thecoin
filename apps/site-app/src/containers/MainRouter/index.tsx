import * as React from 'react';
import { Location } from 'history';

import { useSidebar } from '@the-coin/shared/containers/PageSidebar/actions';

import { Switch, Route } from 'react-router-dom';
import { NotFoundPage } from '@the-coin/shared/containers/NotFoundPage';
import { Accounts } from 'containers/Accounts';
import { AddAccount } from 'containers/AddAccount';
import { Congratulations } from 'containers/AddAccount/Congratulations';
import { GAuth } from 'containers/StoreOnline/Google/gauth';
import { MapMenuItems, SidebarMenuItem } from '@the-coin/shared/containers/PageSidebar/types';
import { RUrl } from '@the-coin/utilities/RUrl';

export const MainRouter = (props: { location: Location }) => {


  const ConstantSidebarItems: SidebarMenuItem[] = 
  [
    {
      link: {
        to: false,
        name: 'Profile',
        header: { avatar: "https://sadanduseless.b-cdn.net/wp-content/uploads/2019/07/yawning-rabbits4.jpg", 
                  primaryDescription: "The quick brown fox jumps over the lazy dog.", 
                  secondaryDescription: "Description2" },
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
        to: new RUrl("/balance"),
        icon: "arrow circle up",
      }
    },
    {
      link: {
        name: "Make a Payment",
        to: new RUrl("/payment"),
        icon: "arrow circle right",
      }
    },
    {
      link: {
        name: "Settings",
        to: new RUrl("/settings"),
        icon: "setting",
      }
    },
    {
      link: {
        name: "Help",
        to: new RUrl("/help"),
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
    <Switch location={props.location}>
      <Route path="/gauth" component={GAuth} />
      <Route path="/" exact component={Accounts} />
      <Route path="/addAccount" component={AddAccount} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/congratulations" component={Congratulations} />
      <Route component={NotFoundPage} />
    </Switch>
  )
}
