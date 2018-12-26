import React from 'react';
import * as styles from './index.module.css';
import Banner from './headerSmall_static.svg';
import Logo from './logo.svg';

export default function Header() {
  return (
    <div>
      <img className={styles.headerLogo} alt="The Coin Website" src={Logo} />
      <img className={styles.headerImage} alt="" src={Banner} />
    </div>
  );
}
