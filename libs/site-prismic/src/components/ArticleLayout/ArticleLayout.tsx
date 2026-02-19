import React from 'react';
import styles from './ArticleLayout.module.css';

export type ArticleLayoutProps = {
  children: React.ReactNode;
};

export const ArticleLayout = ({ children }: ArticleLayoutProps) => {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
};
