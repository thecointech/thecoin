import React from 'react';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { defineMessage } from 'react-intl';
import { ProviderChoice } from '../ProviderChoice';
import { StoreGoogle } from '.';

const text = defineMessage({ defaultMessage: "Store on Google Drive", description: "Store Account: Option to store on GDrive" });
import icon from '../images/google.svg'


export const GDriveStore = () => {

  const activeAccount = useActiveAccount()!;
  //const accountApi = useAccountApi(activeAccount.address);

  return (
    <StoreGoogle disabled={activeAccount.details.storedOnGoogle}>
      <ProviderChoice imgSrc={icon} txt={text} />
    </StoreGoogle>
  );
}
