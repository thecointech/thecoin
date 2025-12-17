import React, { type PropsWithChildren } from "react";
import styles from './styles.module.less';

type AppContainerProps = {
  className?: string,
  shadow?: boolean,
  noPadding?: boolean,
}

export const AppContainer = (props: PropsWithChildren<AppContainerProps>) =>
  <div className={ `
    ${styles.appContainer}
    ${props.className}
    ${props.shadow ? styles.appShadow : ''}
    ${props.noPadding ? '' : styles.appContainerPadding}
  ` }>
    {props.children}
  </div>;
