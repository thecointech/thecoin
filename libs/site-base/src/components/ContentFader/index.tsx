import React, { type PropsWithChildren } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { LessVars } from '@thecointech/site-semantic-theme/variables';
import styles from './styles.module.less';
import { useLocation } from 'react-router';

const classStyles = {
  enter: styles.fadeEnter,
  enterActive: styles.fadeEnterActive,
  exitActive: styles.fadeExitActive,
};

export const ContentFader = (props: PropsWithChildren<{}>) => {
  const location = useLocation();
  return (
    <TransitionGroup className={styles.fadeBase}>
      <CSSTransition
        key={location.key}
        classNames={classStyles}
        timeout={LessVars.pageTransitionDuration}
      >
        {props.children}
      </CSSTransition>
    </TransitionGroup>
  );
}
