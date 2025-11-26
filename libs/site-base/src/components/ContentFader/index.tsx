import React, { type PropsWithChildren } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import styles from './styles.module.less';
import { useLocation, useOutlet } from 'react-router';

const classStyles = {
  enter : styles.fadeEnter,
  enterActive: styles.fadeEnterActive,
  exit: styles.fadeExit,
  exitActive: styles.fadeExitActive,
};

export const ContentFader = (_props: PropsWithChildren<{}>) => {
  const location = useLocation();

  // Use pathname as key since HashRouter doesn't always have location.key
  const transitionKey = location.key || location.pathname;
  const currentOutlet = useOutlet()

  // Store refs for each unique transition key
  const nodeRefs = React.useRef<Map<string, React.RefObject<HTMLDivElement|null>>>(new Map());

  // Get or create a ref for this specific key
  const getNodeRef = (key: string) => {
    if (!nodeRefs.current.has(key)) {
      nodeRefs.current.set(key, React.createRef<HTMLDivElement>());
    }
    return nodeRefs.current.get(key)!;
  };

  console.log("Key: ", transitionKey);
  console.log("Outlet: ", currentOutlet);

  return (
    <SwitchTransition>
      <CSSTransition
        key={transitionKey}
        nodeRef={getNodeRef(transitionKey)}
        classNames={classStyles}
        timeout={1000}
        unmountOnExit
      >
        {(_state) => (
          <div ref={getNodeRef(transitionKey)} className={styles.fadeContainer}>
            {currentOutlet}
          </div>
        )}
      </CSSTransition>
    </SwitchTransition>
  );
}
