import React, { useState } from 'react';
import { defineMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import { useGoogle } from './useGoogle';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/google.svg'

const text = defineMessage({ defaultMessage: "Load from Google Drive", description: "Store Account: Option to store on GDrive" });

export const GDriveRestore = () => {
  const [token, setToken] = useState(undefined as MaybeString);
  const [loading, doTransmit] = useGoogle()
  return token
    ? <Redirect to={`/addAccount/restore/list?token=${token}`} />
    : <ProviderChoice
        onClick={() => doTransmit(setToken)}
        loading={loading}
        imgSrc={icon}
        txt={text}
      />
}
