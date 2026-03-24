import React from 'react';
import { Link } from '@thecointech/shared';
import styles from './styles.module.less';

type Props = {
  to: string;
  children: React.ReactNode;
}
export const LearnMoreLink: React.FC<Props> = ({ to, children }) => {
  const isHashLink = to.startsWith("#");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHashLink) {
      e.preventDefault();
      const elementId = to.substring(1);
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Link to={to} onClick={handleClick} className={styles.learnMoreLink}>
      {children}
      <div className={`${styles.bottomBorder} x2spaceBefore`} />
    </Link>
  )
}
