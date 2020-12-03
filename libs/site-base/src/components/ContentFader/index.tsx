import * as React from 'react';
import { Location } from 'history';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { TransitionDuration } from 'styles/constants';
import styles from './styles.module.less';

type OwnProps = {
  location: Location;
}
type Props = OwnProps;

const classStyles = {
  enter: styles.fadeEnter,
  enterActive: styles.fadeEnterActive,
  exitActive: styles.fadeExitActive,
};

export class ContentFader extends React.PureComponent<Props, {}, null> {
  render() {
    // TODO: Can we remove this location? Check once fading has been
    // implemented on the landing site
    const { location } = this.props;

    return (
      <TransitionGroup className={styles.fadeBase}>
        <CSSTransition
          key={location.key}
          classNames={classStyles}
          timeout={TransitionDuration}
        >
          {this.props.children}
        </CSSTransition>
      </TransitionGroup>
    );
  }
}
