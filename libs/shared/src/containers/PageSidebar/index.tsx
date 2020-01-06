import React, { useMemo } from "react";
import { Sidebar, Menu, MenuItem, Segment, Divider } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { SidebarMenuItem } from "./types";
import styles from "./index.module.css";
import { ApplicationBaseState } from "../../types";
import { selectSidebar } from "./selector";

type Props = {
  visible: boolean;
  inverted?: boolean;
}

export const PageSidebar: React.FC<Props> = (props) => {
  const { visible, inverted } = props;

  const appState = useSelector(s => s as ApplicationBaseState);
  const generators = selectSidebar(appState);
  const menuItems = useMemo(() => {
    let items: SidebarMenuItem[] = [];

    if (generators.rootGenerator)
      items = generators.rootGenerator(appState);

    Object.entries(generators.subGenerators).forEach(([_, generator]) => {
      items = generator(items, appState);
    });
    
    return buildMenuArray(items);
  }, [appState])

  const pusherClass = visible ? styles.mainPagePusherOut : undefined;

  return (
    <Sidebar.Pushable as={Segment} className={styles.mainPageContainer}>
      <Sidebar
        as={Menu}
        animation="push"
        direction="left"
        vertical
        visible={visible}
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

const getAsItem = (item: SidebarMenuItem) =>
    <React.Fragment key={`Fragment${item.link.to}`}>
      <MenuItem
        as={NavLink}
        exact={true}
        key={item.link.to as string}
        to={item.link.to}
      >
        {item.link.name}
      </MenuItem>
      {buildSubMenuArray(item)}
    </React.Fragment>


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
  return subItems ? (
    <Menu.Menu>{buildMenuArray(subItems)}</Menu.Menu>
  ) : (
    undefined
  );
}

// // Map State into a list of menu items.
// function mapStateToProps(state: ApplicationBaseState, ownProps: OwnProps) {
//   let items: SidebarMenuItem[] = [];

//   if (state.sidebar.rootGenerator)
//     items = state.sidebar.rootGenerator(state);

//   Object.entries(state.sidebar.subGenerators).forEach(([_, generator]) => {
//     items = generator(items, state);
//   });
  
//   return {items};
// }
// const v= connect(mapStateToProps)(PageSidebar);

// const ConnectedPageSidebar = buildReducer()(
  
// );
// export { ConnectedPageSidebar as PageSidebar };
