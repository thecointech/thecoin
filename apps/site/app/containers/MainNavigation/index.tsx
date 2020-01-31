import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import HeaderLink from '../../components/HeaderLink';
import styles from './index.module.css';
import { AccountSwitcher } from 'containers/AccountSwitcher';

class Navigation extends React.Component {
  render() {
    return (
      <div className={styles.navContainer}>
        <div className={styles.subscribe}></div>
        <Container>
          <Menu pointing secondary className={styles.mainMenu}>
            <HeaderLink to="/" exact>Home</HeaderLink>
            <HeaderLink to="/howItWorks">How It Works</HeaderLink>
            <HeaderLink to="/FAQ">FAQ</HeaderLink>
          </Menu>
          <AccountSwitcher />
        </Container>   
      </div>
      
    );
  }
}

export default Navigation;
