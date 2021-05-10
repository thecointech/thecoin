import React from "react";
import styles from './styles.module.less';

type AppContainerProps = {
  className?: string,
}

export const AppContainer : React.FC<AppContainerProps> = (props) =>
  <div className={ `${styles.appContainer} ${props.className}` }>{props.children}</div>;

export const AppContainerWithShadow : React.FC<AppContainerProps> = (props) =>
  <div className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.appShadow} ${props.className}` }>{props.children}</div>;

export const AppContainerWithShadowWithoutPadding : React.FC<AppContainerProps> = (props) =>
  <div className={ `${styles.appContainer} ${styles.appShadow}` }>{props.children}</div>;

export const AppContainerForTabs : React.FC<AppContainerProps> = (props) =>
  <div className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.topRightFlat}` }>{props.children}</div>;

