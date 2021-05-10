import React from "react";
import { FormattedMessage } from "react-intl";
import { Header } from "semantic-ui-react";
import styles from "./styles.module.less";

const title = {
  id: "shared.widgets.availablesoon.title",
  defaultMessage: "Coming Soon",
  description: "Title for the Widget Available Soon in the app",
};

export const AvailableSoon : React.FC = (props) => {
  return (
    <div className={styles.availableSoonContainer}> 
        <Header as="h5" id={styles.soon}><FormattedMessage {...title} /></Header>
        <div className={`${styles.availableSoonBlur}`}>
            {props.children}
        </div>
    </div>
  )
}
