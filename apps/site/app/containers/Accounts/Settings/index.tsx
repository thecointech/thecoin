import React from 'react';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { Download } from './download';
import { GoogleConnect } from './gconnect';


interface MyProps {
  account: AccountState;
}

export function Settings(props: MyProps) {
  return (
  <>
    <Download accountName={props.account.name} />
    <GoogleConnect accountName={props.account.name} />
  </>
  );
}