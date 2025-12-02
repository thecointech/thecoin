import React, { type PropsWithChildren } from "react";
import styles from './styles.module.less';
import clsx from 'clsx';

type AppContainerProps = {
  className?: string,
  id?: string
}

const idProps = (id?: string) => (id ? { id } : undefined);

export const AppContainer = (props: PropsWithChildren<AppContainerProps>) =>
  <div {...idProps(props.id)} className={clsx(styles.appContainer, props.className)}>{props.children}</div>;

export const AppContainerWithShadow = (props: PropsWithChildren<AppContainerProps>) =>
  <div {...idProps(props.id)} className={clsx(styles.appContainer, styles.appContainerPadding, styles.appShadow, props.className)}>{props.children}</div>;

export const AppContainerWithShadowWithoutPadding = (props: PropsWithChildren<AppContainerProps>) =>
  <div {...idProps(props.id)} className={clsx(styles.appContainer, styles.appShadow, props.className)}>{props.children}</div>;

export const AppContainerForTabs = (props: PropsWithChildren<AppContainerProps>) =>
  <div {...idProps(props.id)} className={clsx(styles.appContainer, styles.appContainerPadding, styles.topRightFlat, props.className)}>{props.children}</div>;
