import React from 'react';
import { NavLink, NavLinkProps } from 'react-router';
import { Menu } from 'semantic-ui-react';
import styles from './styles.module.less';

interface Props {
  as?: any;
  className?: string;
  children?: React.ReactNode;
}

export const HeaderLink = <TProps extends Props = NavLinkProps&Props>({children, className='', as=NavLink, ...rest}: TProps) => (
  <Menu.Item
    as={as}
    className={`${styles.headerLink} ${className}`}
    {...rest}
  >
    {children}
  </Menu.Item>
);
