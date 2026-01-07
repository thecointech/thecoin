import React, { type PropsWithChildren } from "react";
import { defineMessage, FormattedMessage } from "react-intl";
import { Header } from "semantic-ui-react";
import styles from "./styles.module.less";

const title = defineMessage({
      defaultMessage: "Coming Soon",
      description: "shared.widgets.availablesoon.title:Title for the Widget Available Soon in the app",
});

export const AvailableSoon = ({fill, children}: PropsWithChildren<{fill?: boolean}>) => {
  return (
    <div className={`${styles.availableSoonContainer} ${fill ? styles.fill : ''}`}>
      {children}
      <Header as="h5" className={styles.soon}>
        <FormattedMessage {...title} />
      </Header>
    </div>
  )
}
