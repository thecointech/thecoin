import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

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
    activeClassName="active"
  >
    {props.children}
  </Menu.Item>
);
