import * as React from 'react';
import {
  Sidebar,
  Menu,
  MenuItem,
  Segment,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { ContainerState, SidebarMenuItem } from './types';
import { LocationStoreState, mapLocationStateToProps } from 'containers/Location/selectors';
import { mapSidebarStateToProps } from './selector';
import styles from "./index.module.css"
import { ApplicationRootState } from 'types';
import {buildReducer} from './reducer'


interface OwnProps { }
type Props = OwnProps & LocationStoreState & ContainerState;

class PageSidebar extends React.PureComponent<Props, {}, null> {

  // Utility function builds a list of menu items
  // from the props set to this components store state
  buildMenuArray(items: SidebarMenuItem[]): React.ReactChild[] {
    return items.map(item => {
      return (
        <React.Fragment key={`Fragment${item.link.to}`}>
        <MenuItem as="a" key={item.link.to} to={item.link.to}>
          {item.link.name}
        </MenuItem>
        {this.buildSubMenuArray(item)}
        </React.Fragment>
      )
    });
  }

  buildSubMenuArray(item: SidebarMenuItem) {
    return item.subItems ?
      <Menu.Menu>
        {this.buildMenuArray(item.subItems)}
      </Menu.Menu> :
      undefined;
  }

  render() {
    const { location, items } = this.props;
    const visible = location.pathname !== '/';
    const menuItems = this.buildMenuArray(items);
    const sideMenuWidth = 225;
    const pushed = visible ? sideMenuWidth : 0;
    const push = `translate3d(${pushed}px,0,0)`
    const pushedMarginRight = `${pushed}px`;

    return (
      <Sidebar.Pushable as={Segment} className={styles.mainPageContent}>
        <Sidebar
          as={Menu}
          animation="push"
          direction="left"
          icon="labeled"
          vertical
          visible={visible}
          style={{width: sideMenuWidth}}
        >
          {menuItems}
        </Sidebar>
        <Sidebar.Pusher style={{transform: push, marginRight: pushedMarginRight}}>
          <Segment basic>{this.props.children}</Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

export default buildReducer<OwnProps>()(
  connect((state: ApplicationRootState) => (
  {
    ...mapLocationStateToProps(state),
    ...mapSidebarStateToProps(state)
  }
))(PageSidebar));
