import React from "react";
import styles from './styles.module.less';

export const AppContainer : React.FC = (props) =>
  <div className={ `${styles.appContainer}` }>{props.children}</div>;

export const AppContainerWithShadow : React.FC = (props) =>
  <div className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.appShadow}` }>{props.children}</div>;

export const AppContainerWithShadowWithoutPadding : React.FC = (props) =>
  <div className={ `${styles.appContainer} ${styles.appShadow}` }>{props.children}</div>;

export const AppContainerForTabs : React.FC = (props) => 
  <div className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.topRightFlat}` }>{props.children}</div>;

