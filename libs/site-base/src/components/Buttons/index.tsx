import React, { type PropsWithChildren } from 'react';
import { Button, ButtonProps } from 'semantic-ui-react';


export const ButtonPrimary = ({ children, ...args }: PropsWithChildren<ButtonProps>) =>{
  return (
    <Button {...args} color='red'>
      {children}
    </Button>
  );
}

export const ButtonSecondary = ({ children, ...args }: PropsWithChildren<ButtonProps>) =>{
  return (
    <Button {...args} inverted color='olive'>
      {args.children}
    </Button>
  );
}

export const ButtonTertiary = ({ children, ...args }: PropsWithChildren<ButtonProps>) =>{
  return (
    <Button {...args} color='teal'>
      {args.children}
    </Button>
  );
}
