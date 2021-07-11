import React from 'react';
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/dropbox.svg';
import { defineMessage } from 'react-intl';

const text = defineMessage({
  defaultMessage: "Store on Dropbox",
  description: "The button to save on dropbox for the store your account page"
});


export const DropBoxStore = () =>
  <AvailableSoon>
    <ProviderChoice txt={text} imgSrc={icon} />
  </AvailableSoon>
