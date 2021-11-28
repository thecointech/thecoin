import * as React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { LessVars } from '@thecointech/site-semantic-theme/variables';
import styles from './styles.module.less';

const classStyles = {
  enter: styles.fadeEnter,
  enterActive: styles.fadeEnterActive,
  exit: styles.fadeExit,
  exitActive: styles.fadeExitActive,
};

type Props = { location: any }
export const ContentFader: React.FC<Props> = (props) => {
  const loc = props.location;
  const currentKey = loc.key ?? loc.pathname;
  const [oldKey, setCurrentKey] = React.useState(currentKey);
  return (
    <TransitionGroup className={styles.fadeBase}>
      <CSSTransition
        key={currentKey}
        in={oldKey != currentKey}
        classNames={classStyles}
        timeout={LessVars.pageTransitionMillis}
        addEndListener={() => setCurrentKey(currentKey)}
      >
        <div>{props.children}</div>
      </CSSTransition>
    </TransitionGroup>
  );
}
