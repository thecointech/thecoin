import React from 'react';
import styles from './BlogContainer.module.css';

export type BlogContainerProps = {
  children: React.ReactNode;
  backLink?: React.ReactNode;
};

export const BlogContainer = ({ children, backLink }: BlogContainerProps) => {
  return (
    <div className={styles.container}>
      {backLink && <div className={styles.backLink}>{backLink}</div>}
      {children}
    </div>
  );
};
