import * as React from 'react';
import { Button } from 'semantic-ui-react';

type ArgsButton = {
  active: boolean,
  disabled: boolean,
  content: string,
}

export const ButtonPrimary : React.FC<ArgsButton> = (args) =>{
  return (
    <Button {...args} primary >
      {args.children}
    </Button>
  );
}

export const ButtonSecondary : React.FC<ArgsButton> = (args) =>{
  return (
    <Button {...args} inverted color="olive" >
      {args.children}
    </Button>
  );
}

export const ButtonTertiary : React.FC<ArgsButton> = (args) =>{
  return (
    <Button {...args} secondary >
      {args.children}
    </Button>
  );
}
