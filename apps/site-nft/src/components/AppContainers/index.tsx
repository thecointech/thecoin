import React from "react";
import styles from './styles.module.less';

type AppContainerProps = {
  className?: string,
  shadow?: boolean,
  noPadding?: boolean,
}

export const AppContainer : React.FC<AppContainerProps> = (props) =>
  <div className={ `
    ${styles.appContainer}
    ${props.className}
    ${props.shadow ? styles.appShadow : ''}
    ${props.noPadding ? '' : styles.appContainerPadding}
  ` }>
    {props.children}
  </div>;
