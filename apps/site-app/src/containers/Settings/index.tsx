import * as React from 'react';
import {AppContainerForTabs} from 'components/AppContainers';

import { Tab } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { StorageOptions } from 'containers/Settings/StorageOptions';
import { PersonalDetails } from './PersonalDetails';
import { UserDetails } from './UserDetails';
// import { QRConnect } from './QRConnect';

const translations = defineMessages({
  main : {
      defaultMessage: 'User Settings',
      description: 'app.settings.tabs.main: Title for the tabs the setting page in the app'},
  personaldetails : {
      defaultMessage: 'Personal Details',
      description: 'app.settings.tabs.personaldetails: Title for the tabs the setting page in the app'},
  storage : {
      defaultMessage: 'Account Storage',
      description: 'app.settings.tabs.storage: Title for the tabs the setting page in the app'},
  qrconnect : {
      defaultMessage: 'App Connect',
      description: 'app.settings.tabs.qrconnect: Title for the tabs the setting page in the app'}
});

export const Settings = () => {
  const intl = useIntl();
  const panes = [
    { menuItem: intl.formatMessage({...translations.main}), render: () => <AppContainerForTabs><UserDetails /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...translations.personaldetails}), render: () => <AppContainerForTabs><PersonalDetails /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...translations.storage}), render: () => <AppContainerForTabs><StorageOptions /></AppContainerForTabs> },
    //{ menuItem: intl.formatMessage({...qrconnect}), render: () => <AppContainerForTabs><QRConnect /></AppContainerForTabs> },
  ]
  return (
    <React.Fragment>
      <Tab panes={panes} renderActiveOnly={true} className="x6spaceAfter" />
    </React.Fragment>
  );
}

