import React from "react";
import { Sidebar, Menu, MenuItem, Divider, Icon } from "semantic-ui-react";
import { NavLink } from "react-router";
import { SidebarLink, SidebarState } from "./types";
import { SidebarItemsReducer } from './reducer';
import styles from "./styles.module.less";
import { SidebarHeader } from './SidebarHeader';
import { FormattedMessage } from 'react-intl';

export type Props = {
  inverted?: boolean;
  width?: 'very thin' | 'thin' | 'wide' | 'very wide';
  direction?: "left" | "top" | "right" | "bottom";
}

export const PageSidebar: React.FC<Props> = (props) => {
  const { inverted } = props;
  const state = SidebarItemsReducer.useData();

  return (
    <Sidebar
      as={Menu}
      animation="push"
      direction={props.direction}
      vertical
      visible={state.visible}
      className={styles.mainPageSidebar}
      inverted={inverted}
      width={props.width}
    >
      <MenuItems {...state} />
    </Sidebar>
  );
}

// Utility function builds a list of menu items
// from the props set to this components store state
const MenuItems = ({generators, items}: SidebarState) => {
  let final = Object
    .values(generators) // If we ever go back to multiple generators, we should sort by priority
    .reduce((prev, generator) => generator(prev), items);

  return (
    <>
      {final.header ? <SidebarHeader {...final.header} /> : null}
      <MenuLinks links={final.links} />
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

const MenuDivider = (item: SidebarLink) =>
  <React.Fragment key={`Divider${item.name.id}`}>
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
