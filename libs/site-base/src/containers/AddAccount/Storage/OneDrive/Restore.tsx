import React from 'react';
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/microsoft.svg';
import { defineMessage } from 'react-intl';

const text = defineMessage({
  defaultMessage: "Restore from Microsoft OneDrive",
  description: "Microsoft link for the restore your account page"
});

export const OneDriveRestore = () =>
  <AvailableSoon>
    <ProviderChoice txt={text} imgSrc={icon} />
  </AvailableSoon>
