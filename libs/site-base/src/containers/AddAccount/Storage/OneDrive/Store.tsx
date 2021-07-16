import React from 'react';
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/microsoft.svg';
import { defineMessage } from 'react-intl';

const text = defineMessage({
  defaultMessage: "Store on Microsoft OneDrive",
  description: "The button to save on microsoft for the store your account page"
});

export const OneDriveStore = () =>
  <AvailableSoon>
    <ProviderChoice txt={text} imgSrc={icon} />
  </AvailableSoon>
