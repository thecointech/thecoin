import React from 'react';
import HeaderLink from '../../components/HeaderLink';
// import * as styles from './index.module.css';
const styles = require('./index.module.css');

class Navigation extends React.Component {
  render() {
    return (
      <nav>
        <div className={styles.navContainer}>
          <ul className={styles.mainNav}>
            <li>
              <HeaderLink to="/" exact>
                WELCOME
              </HeaderLink>
            </li>
            <li>
              <HeaderLink to="/accounts">ACCOUNTS</HeaderLink>
            </li>
            <li>
              <HeaderLink to="/howItWorks">HOW IT WORKS</HeaderLink>
            </li>
            <li>
              <HeaderLink to="/contact">CONTACT</HeaderLink>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navigation;
