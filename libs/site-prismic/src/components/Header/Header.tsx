import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink}>
        <div className={styles.logo} />
      </Link>
    </header>
  );
};
