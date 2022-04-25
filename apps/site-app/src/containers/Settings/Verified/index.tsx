import * as React from 'react';
import { Verified } from './Verified';
import { Unverified } from './Unverified';
import { PropsVerified } from './types';
import { InProcess } from './InProcess';


export const AccountVerify = (props: PropsVerified) => {
  switch(props.details?.status) {
    case "verified": return <Verified />
    case "submitted": return <InProcess />
    default: return <Unverified {...props} />
  }
}

