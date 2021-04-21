import React from "react";
import { Sidebar, Menu, MenuItem, Divider, Icon, Header } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { SidebarMenuItem } from "./types";
import styles from "./styles.module.less";
import { ApplicationBaseState } from "../../types";
import { selectSidebar } from "./selector";
import { useWindowDimensions } from '../../components/WindowDimensions';
import { breakpointsValues } from '../../components/ResponsiveTool';

type Props = {
  visible?: boolean;
  inverted?: boolean;
  width?: 'very thin' | 'thin' | 'wide' | 'very wide';
}

export const PageSidebar: React.FC<Props> = (props) => {
  const { visible, inverted } = props;
  const menuItems = useMenuItems();
  const { width } = useWindowDimensions();

  return (
      <Sidebar
        as={Menu}
        animation="push"
        direction="left"
        vertical
        visible={isVisible(menuItems, width, visible)}
        className={styles.mainPageSidebar}
        inverted={inverted}
        width={props.width}
      >
        {menuItems}
      </Sidebar>
  );
}

const useMenuItems = () => {
  let items: SidebarMenuItem[] = [];
  const appState = useSelector(s => s as ApplicationBaseState);
  const generators = selectSidebar(appState);

  Object.entries(generators.generators).forEach(([_, generator]) => {
    items = generator(items, appState);
  });

  return buildMenuArray(items);
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
        <Icon name={item.link.icon} />
        {item.link.name}
      </MenuItem>
      {buildSubMenuArray(item)}
    </React.Fragment>
  )
}

  // Display if requested, or if not Small Screen / Mobile
const isVisible = (menuItems: unknown[], pageWidth: number, visible?: boolean): boolean =>
  visible ?? (
    (menuItems && menuItems.length > 0) &&
    pageWidth > breakpointsValues.tablet
  );

const getAsHeader = (item: SidebarMenuItem) =>
  <div className={styles.headerSidebar} key={`Header${item.link.name}`}>
    <Header as="h5" className={ `appTitles x4spaceBefore` } >
      {item.link.name}
    </Header>
    <div className={`${styles.containerAvatar}` }>
      <img className={styles.avatarSidebar} src={item.link.header?.avatar} />
    </div>
    <div className={`${styles.hozizontalScrollingTextBox} ${styles.primaryDescriptionSidebar}` }>
      <span>{item.link.header?.primaryDescription}</span>
    </div>
    <Icon name="caret right" disabled size='tiny' id={ `${styles.moreToSee}` } />
    <div className={ `${styles.secondaryDescriptionSidebar} x2spaceBefore` }><span>{item.link.header?.secondaryDescription}</span></div>
  </div>


const getAsDivider = (item: SidebarMenuItem) =>
  <Divider horizontal key={`Divider${item.link.name}`}>
    {item.link.name}
  </Divider>

// Utility function builds a list of menu items
// from the props set to this components store state
const buildMenuArray = (items: SidebarMenuItem[]): React.ReactChild[] => {
  return items.map(item => {
    //item.link.to !== false ? getAsItem(item) : getAsDivider(item)
      if (item.link.header !== undefined ){
        return getAsHeader(item);
      }
      else if (item.link.to === false){
        return getAsDivider(item);
      }
      else {
        return getAsItem(item);
      }
    }
  );
}

const buildSubMenuArray = (item: SidebarMenuItem) => {
  const { subItems } = item;
  return subItems
    ? <Menu.Menu>{buildMenuArray(subItems)}</Menu.Menu>
    : undefined;
}
