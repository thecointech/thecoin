import * as React from 'react';
import { Location } from 'history';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styles from './index.module.css';

interface OwnProps {
  location: Location;
}
type Props = OwnProps;

const classStyles = {
  enter: styles.fadeEnter,
  enterActive: styles.fadeEnterActive,
  enterDone: styles.fadeEnterDone,
  exitActive: styles.fadeExitActive,
};

class ContentFader extends React.PureComponent<Props, {}, null> {
  render() {
    const { location } = this.props;
    return (
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames={classStyles}
          timeout={2500}
        >
          {this.props.children}
        </CSSTransition>
      </TransitionGroup>
    );
  }
}

export default ContentFader;
