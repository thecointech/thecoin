import React, { useState } from 'react';
import { defineMessage } from 'react-intl';
import { Navigate, useLocation } from 'react-router';
import { useGoogle } from './useGoogle';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/google.svg'

const text = defineMessage({ defaultMessage: "Load from Google Drive", description: "Store Account: Option to store on GDrive" });

export const GDriveRestore = () => {
  const [token, setToken] = useState(undefined as MaybeString);
  const { search } = useLocation();
  const [loading, doTransmit] = useGoogle()
  return token
    ? <Navigate to={`/addAccount/restore/list${search ? search + '&' : '?'}token=${token}`} />
    : <ProviderChoice
      onClick={() => doTransmit(setToken)}
      loading={loading}
      imgSrc={icon}
      txt={text}
    />
}
