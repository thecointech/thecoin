import React, { useEffect } from 'react';
import { Account } from '@thecointech/shared/containers/Account';
import { Redirect } from 'react-router-dom';
import { NormalizeAddress } from '@thecointech/utilities'
import {Signer } from 'ethers';

// Complete initialization of a new account
// The address is passed in via query, and the
// path to redirect to once complete

type Props = {
  signer: Signer,
  address: string,
  redirect: string,
}
export const CompleteInit = ({signer, address, redirect}: Props) => {

  // Inject reducers/sagas.
  const account = Account(NormalizeAddress(address));
  account.useStore();
  const api = account.useApi();
  const data = account.useData();

  const isInitialized = data.idx && !data.idxIO;
  useEffect(() => {
    if (!isInitialized) {
      api.setSigner(signer)
    }
  }, [])

  return isInitialized
    ? <Redirect to={redirect} />
    : <div>Completing initialization</div>
}
