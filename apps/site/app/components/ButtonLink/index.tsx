import * as React from 'react';
import { Button, ButtonProps } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

interface ButtonLinkProps extends ButtonProps {
  to: string;
}

export default (props: ButtonLinkProps) => {
  const { to, ...rest } = props;
  return (
    <Button
      as={Link}
      to={to}
      className={`${styles.ui} ${styles.button} ${styles.mainButton}`}
      {...rest}
    />
  );
};
