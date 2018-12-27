import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import * as styles from './index.module.css';

interface HeaderLinkProps {
  to: string;
  exact?: boolean;
  children: ReactNode;
}

export default (props: HeaderLinkProps) => (
  <NavLink
    to={props.to}
    exact={props.exact}
    activeClassName={styles.activeNavLink}
  >
    {props.children}
  </NavLink>
);
