import * as React from 'react';
import { Sidebar, Menu, MenuItem, Segment, Divider } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  ContainerState,
  SidebarMenuItem,
  SidebarMenuElement,
} from './types';
import { mapStateToProps } from './selector';
import { buildReducer } from './reducer';
import styles from './index.module.css';

interface OwnProps {
  visible: boolean;
}
type Props = OwnProps & ContainerState;

class PageSidebar extends React.PureComponent<Props, {}, null> {
  getAsItem(item: SidebarMenuItem) {
    return (
      <React.Fragment key={`Fragment${item.link.to}`}>
        <MenuItem as={NavLink} exact={true} key={item.link.to as string} to={item.link.to}>
          {item.link.name}
        </MenuItem>
        {this.buildSubMenuArray(item)}
      </React.Fragment>
    );
  }

  getAsDivider(item: SidebarMenuItem) {
    return <Divider horizontal key={`Divider${item.link.name}`}>{item.link.name}</Divider>;
  }

  // Utility function builds a list of menu items
  // from the props set to this components store state
  buildMenuArray(items: SidebarMenuElement[]): React.ReactChild[] {
    return items.map(
      item =>
        (item.link.to !== false) ? this.getAsItem(item) : this.getAsDivider(item),
    );
  }

  buildSubMenuArray(item: SidebarMenuItem) {
    const { subItems, subParentName } = this.props;
    return (subItems && item.link.name == subParentName) ? (
        <Menu.Menu>{this.buildMenuArray(subItems)}</Menu.Menu>
      ) : undefined;
  }

  render() {
    const { visible, items } = this.props;
    const menuItems = this.buildMenuArray(items)

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
        >
          {menuItems}
        </Sidebar>
        <Sidebar.Pusher className={pusherClass}>
          {this.props.children}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

export default buildReducer<OwnProps>()(
  connect(mapStateToProps)(PageSidebar),
);
