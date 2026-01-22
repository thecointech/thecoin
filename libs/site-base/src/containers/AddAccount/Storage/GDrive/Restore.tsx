import React, { useState } from 'react';
import { defineMessage } from 'react-intl';
import { Navigate, useLocation } from 'react-router';
import { useGoogle } from './useGoogle';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/google.svg'

const text = defineMessage({ defaultMessage: "Load from Google Drive", description: "Store Account: Option to store on GDrive" });

export const GDriveRestore = () => {
  const [token, setToken] = useState<string>();
  const [loading, doTransmit] = useGoogle();
  const { search } = useLocation()

  const params = new URLSearchParams(search);
  if (token) params.set('token', token);
  return token
    ? <Navigate to={`/addAccount/restore/list?${params}`} />
    : <ProviderChoice
        onClick={() => doTransmit(setToken)}
        loading={loading}
        imgSrc={icon}
        txt={text}
      />
}
