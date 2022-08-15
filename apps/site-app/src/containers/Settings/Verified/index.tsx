import * as React from 'react';
import { Verified } from './Verified';
import { Unverified } from './Unverified';
import { PropsVerified } from './types';
import { InProcess } from './InProcess';


export const AccountVerify = (props: PropsVerified) => {

  // Sneaky override to allow re-verifying
  // (using it for testing, but could be useful elsewhere)
  if (props.forceVerify) {
    return <Unverified {...props} />
  }

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

