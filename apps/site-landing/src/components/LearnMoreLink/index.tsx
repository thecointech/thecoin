import React from 'react';
import { Link } from 'react-router';
import styles from './styles.module.less';

type Props = {
  to: string;
}
export const LearnMoreLink: React.FC<Props> = ({ to, children }) =>
  <Link to={to} className={styles.learnMoreLink}>
    {children}
    <div className={`${styles.bottomBorder} x2spaceBefore`} />
  </Link>

