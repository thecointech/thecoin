import * as React from 'react';
import {
  Sidebar,
  Menu,
  Icon,
  SidebarProps,
  MenuItem,
  Segment,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { ApplicationRootState } from 'types';
import { makeSelectLocation } from 'containers/App/selectors';
import { createStructuredSelector } from 'reselect';
import { Location } from 'history'

interface OwnProps {}
interface StateProps {
  route: Location
}
type Props = OwnProps & StateProps & SidebarProps;

class PageSidebar extends React.PureComponent<Props, {}, null> {
  render() {
    const { route } = this.props;
    const visible = route.pathname !== '/';
    
    return (
      <Sidebar.Pushable as={Segment}>
        <Sidebar
          as={Menu}
          animation="push"
          direction="left"
          icon="labeled"
          inverted
          vertical
          visible={visible}
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

// Map RootState to your StateProps
const mapStateToProps = createStructuredSelector<ApplicationRootState, StateProps>({
  // All the keys and values are type-safe
  route: makeSelectLocation()
});

export default connect(mapStateToProps)(PageSidebar);
