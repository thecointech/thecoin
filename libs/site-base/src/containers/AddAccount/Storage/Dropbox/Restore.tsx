import React from 'react';
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';
import { ProviderChoice } from '../ProviderChoice';
import icon from './images/dropbox.svg';
import { defineMessage } from 'react-intl';

const text = defineMessage({
  defaultMessage: "Restore from Dropbox",
  description: "Dropbox link for the restore your account page"
});

type Props = {
  query: string;
}

export const DropBoxRestore = ({ query: _ }: Props) =>
  <AvailableSoon>
    <ProviderChoice txt={text} imgSrc={icon} />
  </AvailableSoon>
