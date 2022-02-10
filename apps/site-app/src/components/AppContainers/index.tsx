import React from "react";
import styles from './styles.module.less';

type AppContainerProps = {
  className?: string,
  id?: string
}

export const AppContainer : React.FC<AppContainerProps> = (props) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${props.className}` }>{props.children}</div>;

export const AppContainerWithShadow : React.FC<AppContainerProps> = (props) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.appShadow} ${props.className}` }>{props.children}</div>;

export const AppContainerWithShadowWithoutPadding : React.FC<AppContainerProps> = (props) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${styles.appShadow} ${props.className ?? ''}` }>{props.children}</div>;

export const AppContainerForTabs : React.FC<AppContainerProps> = (props) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.topRightFlat}` }>{props.children}</div>;

