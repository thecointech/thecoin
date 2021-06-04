import * as React from 'react';
import {AppContainerForTabs} from 'components/AppContainers';

import { Tab } from 'semantic-ui-react';
import { useIntl } from 'react-intl';
import { StorageOptions } from 'containers/Settings/StorageOptions';
import { PersonalDetails } from './PersonalDetails';
import { UserDetails } from './UserDetails';
import { ColumnRightTop } from 'containers/ColumnRight/Top';
import { ColumnRightBottom } from 'containers/ColumnRight/Bottom';

const main = { id:"app.settings.tabs.main",
                defaultMessage:"User Settings",
                description:"Title for the tabs the setting page in the app" };
const personaldetails = { id:"app.settings.tabs.interact",
                defaultMessage:"Personal Details",
                description:"Title for the tabs the setting page in the app" };
const storage = { id:"app.settings.tabs.storage",
                defaultMessage:"Account Storage",
                description:"Title for the tabs the setting page in the app" };

export const Settings = () => {
  const intl = useIntl();
  const panes = [
    { menuItem: intl.formatMessage({...main}), render: () => <AppContainerForTabs><UserDetails /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...personaldetails}), render: () => <AppContainerForTabs><PersonalDetails /></AppContainerForTabs> },
    { menuItem: intl.formatMessage({...storage}), render: () => <AppContainerForTabs><StorageOptions /></AppContainerForTabs> },
  ]
  return (
    <React.Fragment>
      <ColumnRightTop />
      <Tab panes={panes} renderActiveOnly={true} className={ `x6spaceAfter x2spaceBefore` } />
      <ColumnRightBottom />
    </React.Fragment>
  );
}

