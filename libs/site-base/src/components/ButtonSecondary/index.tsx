import * as React from 'react';
import { Button } from 'semantic-ui-react';
import styles from './styles.module.less';

type ArgsButtonSecondary = {
  active: boolean,
  disabled: boolean,
  content: string,
}

export const ButtonSecondary : React.FC = (args:ArgsButtonSecondary) =>{
  return (
    <Button {...args.active} inverted color="olive" {...args.disabled} className={styles.theCoinSecondary}>
      {args.content}
    </Button>
  );
}
