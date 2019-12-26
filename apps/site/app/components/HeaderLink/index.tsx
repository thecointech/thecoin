import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import cx from 'classnames';
import styles from '../../styles/base.css';

interface HeaderLinkProps {
  to: string;
  exact?: boolean;
  children: ReactNode;
}

export default (props: HeaderLinkProps) => (
  <Menu.Item
    as={NavLink}
    to={props.to}
    exact={props.exact}
    className={cx(styles.ui, styles.menu, styles.link, styles.item)}
    activeClassName="active"
  >
    {props.children}
  </Menu.Item>
);
