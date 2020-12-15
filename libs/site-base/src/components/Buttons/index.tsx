import * as React from 'react';
import { Button } from 'semantic-ui-react';
import styles from './styles.module.less';

type ArgsButton = {
  active: boolean,
  disabled: boolean,
  content: string,
}

export const ButtonPrimary : React.FC<ArgsButton> = (args) =>{
  return (
    <Button {...args} primary className={styles.theCoinSecondary}>
      {args.children}
    </Button>
  );
}

export const ButtonSecondary : React.FC<ArgsButton> = (args) =>{
  return (
    <Button {...args} inverted color="olive" className={styles.theCoinSecondary}>
      {args.children}
    </Button>
  );
}

export const ButtonTertiary : React.FC<ArgsButton> = (args) =>{
  return (
    <Button {...args} secondary className={styles.theCoinSecondary}>
      {args.children}
    </Button>
  );
}
