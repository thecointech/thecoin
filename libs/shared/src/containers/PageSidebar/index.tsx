import React from "react";
import { Sidebar, Menu, MenuItem, Divider, Icon } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { SidebarLink } from "./types";
import { useWindowDimensions } from '../../components/WindowDimensions';
import { breakpointsValues } from '../../components/ResponsiveTool';
import { SidebarItemsReducer } from './reducer';
import styles from "./styles.module.less";
import { SidebarHeader } from './SidebarHeader';
import { FormattedMessage } from 'react-intl';

export type Props = {
  visible?: boolean;
  inverted?: boolean;
  width?: 'very thin' | 'thin' | 'wide' | 'very wide';
}

export const PageSidebar: React.FC<Props> = (props) => {
  const { visible, inverted } = props;
  const { width } = useWindowDimensions();

  return (
    <Sidebar
      as={Menu}
      animation="push"
      direction="left"
      vertical
      visible={isVisible(width, visible)}
      className={styles.mainPageSidebar}
      inverted={inverted}
      width={props.width}
    >
      <MenuItems />
    </Sidebar>
  );
}

// Utility function builds a list of menu items
// from the props set to this components store state
const MenuItems = () => {
  const state = SidebarItemsReducer.useData();
  let items = Object
    .values(state.generators) // If we ever go back to multiple generators, we should sort by priority
    .reduce((prev, generator) => generator(prev), state.items);

  return (
    <>
      {items.header ? <SidebarHeader {...items.header} /> : null}
      <MenuLinks links={items.links} />
    </>
  );
}

const MenuLinks = (props: { links: SidebarLink[] }) =>
  <>
    {props.links.map(item => (
      item.to === false
        ? MenuDivider(item)
        : MenuLink(item)
    ))}
  </>

// Display if requested, or if not Small Screen / Mobile
const isVisible = (pageWidth: number, visible?: boolean): boolean =>
  visible ?? pageWidth > breakpointsValues.tablet

const MenuDivider = (item: SidebarLink) =>
  <React.Fragment key={`Divider${item.name}`}>
    <Divider horizontal>
      <FormattedMessage {...item.name} />
    </Divider>
    {buildSubMenuArray(item)}
  </React.Fragment>

const MenuLink = (item: SidebarLink) => {
  let url = item.to.toString();
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
        <Icon name={item.icon} />
        <FormattedMessage {...item.name} />
      </MenuItem>
      {buildSubMenuArray(item)}
    </React.Fragment>
  )
}


const buildSubMenuArray = (link: SidebarLink) =>
  link.subItems
    ? <Menu.Menu>
      <MenuLinks links={link.subItems} />
    </Menu.Menu>
    : undefined;
