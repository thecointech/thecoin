import * as React from 'react';
import {
  Sidebar,
  Menu,
  MenuItem,
  Segment,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { LocationStoreState, mapLocationStateToProps } from 'containers/Location/selectors';
import { ApplicationRootState } from 'types';
import { ContainerState, SidebarMenuItem } from './types';
import { mapSidebarStateToProps } from './selector';
import {buildReducer} from './reducer'
import styles from "./index.module.css"


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
