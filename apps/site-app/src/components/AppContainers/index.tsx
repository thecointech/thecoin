import React from "react";
import { Container } from "semantic-ui-react";
import styles from './styles.module.less';

export const AppContainer : React.FC = (props) =>
  <Container className={ `${styles.appContainer}` }>{props.children}</Container>;

export const AppContainerWithShadow : React.FC = (props) =>
  <Container className={ `${styles.appContainer} ${styles.appShadow}` }>{props.children}</Container>;

export const AppContainerForTabs : React.FC = (props) => 
  <Container className={ `${styles.appContainer} ${styles.topRightFlat}` }>{props.children}</Container>;

