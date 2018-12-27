import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import HeaderLink from '../../components/HeaderLink';
import styles from './index.module.css';

class Navigation extends React.Component {
  render() {
    return (
      <div className={styles.navContainer}>
        <Container>
          <Menu borderless>
            <HeaderLink to="/" exact>
              HOME
            </HeaderLink>
            <HeaderLink to="/accounts" exact>
              ACCOUNTS
            </HeaderLink>
            <HeaderLink to="/howItWorks" exact>
              HOW IT WORKS
            </HeaderLink>
            <HeaderLink to="/FAQ" exact>
              FAQ
            </HeaderLink>
          </Menu>
        </Container>
      </div>
    );
  }
}

export default Navigation;
