import React from 'react';
import { Menu, Container, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import HeaderLink from '../../components/HeaderLink';
import styles from '../../styles/base.css';

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
            <HeaderLink to="/accounts/generate">Accounts</HeaderLink>
          </Menu>
          <Button as={ NavLink } right to="/accounts/generate" content='Login / Create an Account' secondary size='massive' id='createAccountHeader'/>
        </Container>   
      </div>
      
    );
  }
}

export default Navigation;
