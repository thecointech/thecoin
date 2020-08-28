import React, { useMemo } from "react";
import { Sidebar, Menu, MenuItem, Segment, Divider } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { SidebarMenuItem } from "./types";
import styles from "./styles.module.css";
import { ApplicationBaseState } from "../../types";
import { selectSidebar } from "./selector";
import { useSidebar } from "./reducer";

type Props = {
  visible?: boolean;
  inverted?: boolean;
}

export const PageSidebar: React.FC<Props> = (props) => {
  const { visible, inverted } = props;
  useSidebar();
  const appState = useSelector(s => s as ApplicationBaseState);
  const generators = selectSidebar(appState);
  const menuItems = useMemo(() => {
    let items: SidebarMenuItem[] = [];

    Object.entries(generators.generators).forEach(([_, generator]) => {
      items = generator(items, appState);
    });

    return buildMenuArray(items);
  }, [appState, generators])

  const isVisible = visible ?? (menuItems && menuItems.length > 0);
  const pusherClass = isVisible ? styles.mainPagePusherOut : undefined;

  return (
    <Sidebar.Pushable as={Segment} className={styles.mainPageContainer}>
      <Sidebar
        as={Menu}
        animation="push"
        direction="left"
        vertical
        visible={isVisible}
        className={styles.mainPageSidebar}
        inverted={inverted}
      >
        {menuItems}
      </Sidebar>
      <Sidebar.Pusher className={pusherClass}>
        {props.children}
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

const getAsItem = (item: SidebarMenuItem) => {
  let url = item.link.to.toString();
  if (!url.startsWith('/'))
    url = '/' + url;;

  return (
    <React.Fragment key={`Fragment${url}`}>
      <MenuItem
        as={NavLink}
        exact={true}
        key={url}
        to={url}
      >
        {item.link.name}
      </MenuItem>
      {buildSubMenuArray(item)}
    </React.Fragment>
  )
}



const getAsDivider = (item: SidebarMenuItem) =>
  <Divider horizontal key={`Divider${item.link.name}`}>
    {item.link.name}
  </Divider>

// Utility function builds a list of menu items
// from the props set to this components store state
const buildMenuArray = (items: SidebarMenuItem[]): React.ReactChild[] => {
  return items.map(item =>
    item.link.to !== false ? getAsItem(item) : getAsDivider(item)
  );
}

const buildSubMenuArray = (item: SidebarMenuItem) => {
  const { subItems } = item;
  return subItems 
    ? <Menu.Menu>{buildMenuArray(subItems)}</Menu.Menu>
    : undefined;
}