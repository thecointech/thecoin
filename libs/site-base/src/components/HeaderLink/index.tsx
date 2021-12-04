import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import styles from './styles.module.less';

interface Props {
  to: string;
  external?: boolean,
  exact?: boolean;
  className?: string;
}

// Select the appropriate props for an external link (raw anchor)
// vs an internal link (NavLink)
const selectProps = ({external, to, exact}: Props) =>
  external
    ? { href: to, as: "a" }
    : { exact, to, activeClassName: "active", as: NavLink }

export const HeaderLink: React.FC<Props> =  (props) => (
  <Menu.Item
    {...selectProps(props)}
    className={`${styles.headerLink} ${props.className}`}
  >
    {props.children}
  </Menu.Item>
);
