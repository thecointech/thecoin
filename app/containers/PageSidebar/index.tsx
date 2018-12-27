import * as React from 'react';
import {
  Sidebar,
  Menu,
  Icon,
  SidebarProps,
  MenuItem,
  Segment,
} from 'semantic-ui-react';

interface PageSidebarProps extends React.Props<SidebarProps> {}

export class PageSidebar extends React.PureComponent<PageSidebarProps> {
  render() {
    return (
      <Sidebar.Pushable as={Segment}>
        <Sidebar
          as={Menu}
          animation="push"
          direction="left"
          icon="labeled"
          inverted
          vertical
          visible
          width="thin"
        >
          <MenuItem as="a">
            <Icon name="home" />
            Home
          </MenuItem>
          <MenuItem as="a">
            <Icon name="gamepad" />
            Games
          </MenuItem>
          <MenuItem as="a">
            <Icon name="camera" />
            Channels
          </MenuItem>
        </Sidebar>
        <Sidebar.Pusher>
          <Segment basic>{this.props.children}</Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}
