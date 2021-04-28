import React from 'react';
import { Meta } from '@storybook/react';
import { LanguageSwitcher as LanguageComponent } from '.';
import { configureAppStore } from '@thecointech/shared/store';
import { Provider } from 'react-redux';
import { useLanguageProvider } from '@thecointech/shared/containers/LanguageProvider/reducer';

export default {
  title: 'App/Language',
  component: LanguageComponent,
  decorators: [
    (Story) => {
      useLanguageProvider();
      return <Story />
    },
    (Story) => {
      const store = configureAppStore();
      return <Provider store={store}><Story /></Provider>
    },]
} as Meta;

export const Language = () => <LanguageComponent />;
