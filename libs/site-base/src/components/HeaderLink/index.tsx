import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import styles from './styles.module.less';

interface Props {
  to: string;
  exact?: boolean;
  className?: string;
}

export const HeaderLink: React.FC<Props> =  ({to, exact, children, className=""}) => (
  <Menu.Item
    as={NavLink}
    to={to}
    exact={exact}
    activeClassName="active"
    className={`${styles.headerLink} ${className}`}
  >
    {children}
  </Menu.Item>
);
