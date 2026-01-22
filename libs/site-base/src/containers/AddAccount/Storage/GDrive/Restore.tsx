import React, { useState } from 'react';
import { defineMessage } from 'react-intl';
import { Navigate } from 'react-router';
import { useGoogle } from './useGoogle';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/google.svg'

const text = defineMessage({ defaultMessage: "Load from Google Drive", description: "Store Account: Option to store on GDrive" });

type Props = {
  query: string;
}

export const GDriveRestore = ({ query }: Props) => {
  const [token, setToken] = useState(undefined as MaybeString);
  const [loading, doTransmit] = useGoogle();
  const preservedQuery = query ? `&${query.slice(1)}` : '';

  return token
    ? <Navigate to={`/addAccount/restore/list?token=${token}${preservedQuery}`} />
    : <ProviderChoice
        onClick={() => doTransmit(setToken)}
        loading={loading}
        imgSrc={icon}
        txt={text}
      />
}
