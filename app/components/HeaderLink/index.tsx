import React from 'react';
import { NavLink } from 'react-router-dom';
import * as styles from './index.module.css';

export default props => (
  <NavLink
    to={props.to}
    exact={props.exact}
    activeClassName={styles.activeNavLink}
  >
    {props.children}
  </NavLink>
);
