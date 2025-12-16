import { Header, Message } from "semantic-ui-react";
import styles from "./NoAccounts.module.less";

export const NoAccounts = () => {
  return (
    <Message warning>
      <div className={styles.noAccountsMessage}>
        <div className={styles.icon}>⚠️</div>
        <Header size="medium">No Accounts Found</Header>
        <p>The scraper did not find any accounts. Please try running the login process again.</p>
      </div>
    </Message>
  );
}
