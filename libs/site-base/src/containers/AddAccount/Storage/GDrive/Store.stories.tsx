import React from 'react';
import { GDriveStore } from './Store';
import { withAccounts } from '@thecointech/storybookutils';
import { IWindow } from './googleUtils';
import { log } from '@thecointech/logging';

export default {
  title: "Base/Storage/GDrive/Store",
  component: GDriveStore,
  decorators: [withAccounts()]
};

export const Store = {
  render: () => {
    // Simulate the process of fetching a code
    // Override the window open & trigger the update
    window.open = (url?: string) => {
      log.trace('I would have opened: ' + url);
      const code = url?.split('code=')[1];
      setTimeout(() => {
        (window as IWindow).completeGauthLogin?.(code!);
      }, 500)
      return window;
    }
    return <GDriveStore />
  }
}
