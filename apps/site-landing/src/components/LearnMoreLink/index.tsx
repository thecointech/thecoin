import React from 'react';
import { Link } from '@thecointech/shared';
import styles from './styles.module.less';

type Props = {
  to: string;
  children: React.ReactNode;
}
export const LearnMoreLink: React.FC<Props> = ({ to, children }) =>
  <Link to={to} className={styles.learnMoreLink}>
    {children}
    <div className={`${styles.bottomBorder} x2spaceBefore`} />
  </Link>
