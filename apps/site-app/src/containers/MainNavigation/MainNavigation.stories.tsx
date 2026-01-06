import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { MainNavigation } from '.';
import { withAccounts, withLanguageProvider, withMediaContext, withReducer } from '@thecointech/storybookutils';
import { SidebarItemsReducer } from '@thecointech/shared/containers/PageSidebar';
import styles from '../App/styles.module.less';

export default {
  title: 'App/Navigation',
  component: MainNavigation,
  decorators: [
    withReducer(SidebarItemsReducer),
    withMediaContext,
    withLanguageProvider,
    withAccounts(),
  ]
} as Meta;

SidebarItemsReducer.initialize({
  items: {
    header: null,
    links: [
      {
        "name": { "id": "2", "defaultMessage": "Home" },
        "to": "/",
        "icon": "home"
      },
      {
        "name": { "id": "3", "defaultMessage": "Top up Balance" },
        "to": "/balance",
        "icon": "arrow circle up"
      },
    ]
  }
})
export const Navigation = () => (
  <div id={styles.app}>
    <MainNavigation />
  </div>
);

