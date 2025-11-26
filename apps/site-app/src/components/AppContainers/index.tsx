import React, { type PropsWithChildren } from "react";
import styles from './styles.module.less';

type AppContainerProps = {
  className?: string,
  id?: string
}

export const AppContainer = (props: PropsWithChildren<AppContainerProps>) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${props.className}` }>{props.children}</div>;

export const AppContainerWithShadow = (props: PropsWithChildren<AppContainerProps>) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.appShadow} ${props.className}` }>{props.children}</div>;

export const AppContainerWithShadowWithoutPadding = (props: PropsWithChildren<AppContainerProps>) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${styles.appShadow} ${props.className ?? ''}` }>{props.children}</div>;

export const AppContainerForTabs = (props: PropsWithChildren<AppContainerProps>) =>
  <div id={ `${props.id}` } className={ `${styles.appContainer} ${styles.appContainerPadding} ${styles.topRightFlat}` }>{props.children}</div>;

