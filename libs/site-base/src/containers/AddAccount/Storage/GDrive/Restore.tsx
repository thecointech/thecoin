import React, { useState } from 'react';
import { defineMessage } from 'react-intl';
import { GDriveBase } from './Base';
import { Redirect } from 'react-router-dom';

const text = defineMessage({ defaultMessage: "Load from Google Drive", description: "Store Account: Option to store on GDrive" });

export const GDriveRestore = () => {
  const [token, setToken] = useState(undefined as MaybeString);
  return token
    ? <Redirect to={`/addAccount/restoreList?token=${token}`} />
    : <GDriveBase text={text} onAuth={setToken} />
}
