import * as React from 'react';
import { Verified } from './Verified';
import { Unverified } from './Unverified';
import { PropsVerified } from './types';
import { InProcess } from './InProcess';


export const AccountVerify = (props: PropsVerified) => {
  switch(props.details?.status) {
    case "approved":
    case "completed":
      return <Verified />
    case "waiting":
    case "inreview":
      return <InProcess />
    default: return <Unverified {...props} />
  }
}

