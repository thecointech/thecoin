import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, ButtonProps } from 'semantic-ui-react';

//import styles from './styles.module.less';

export type ArgsButton = {
  active: boolean,
  disabled: boolean,
  content: string,
  className: string,
  as: NavLink,
}

export const ButtonPrimary : React.FC<ButtonProps> = (args) =>{
  return (
    <Button {...args} color='red'>
      {args.children}
    </Button>
  );
}

export const ButtonSecondary : React.FC<ButtonProps> = (args) =>{
  return (
    <Button {...args} inverted color='olive'>
      {args.children}
    </Button>
  );
}

export const ButtonTertiary : React.FC<ButtonProps> = (args) =>{
  return (
    <Button {...args} color='teal'>
      {args.children}
    </Button>
  );
}
