import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import HeaderLink from '../../components/HeaderLink';

import styles from '../../styles/base.css';

class Navigation extends React.Component {
  render() {
    return (
      <div className={styles.navContainer}>
        <div className={styles.subscribe}></div>
        <Container
          style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '1600px',
          }}
        >
          <Menu className={styles.mainMenu}>
            <HeaderLink to="/" exact>
              HOME
            </HeaderLink>
            <HeaderLink to="/accounts">ACCOUNTS</HeaderLink>
            <HeaderLink to="/howItWorks">HOW IT WORKS</HeaderLink>
            <HeaderLink to="/FAQ">FAQ</HeaderLink>
          </Menu>
        </Container>
      </div>
    );
  }
}

export default Navigation;
