import React from 'react';
import { Menu, Container, Dropdown } from 'semantic-ui-react';
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
          </Menu>
          <Dropdown button text='My Accounts' id='createAccountHeader'>
            <Dropdown.Menu>
              <Dropdown.Header>New Account</Dropdown.Header>
                <Dropdown.Item text='New Account' description='' as={ NavLink } to="/accounts/" />
                <Dropdown.Item text='Connect' description='' as={ NavLink } to="/accounts/" />
              <Dropdown.Divider />
                <Dropdown.Item text='Login' />
            </Dropdown.Menu>
          </Dropdown>
        </Container>   
      </div>
      
    );
  }
}

export default Navigation;
