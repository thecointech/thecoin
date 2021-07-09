import { OfflineStore as Component } from './Store';
import { withAccounts } from '@thecointech/storybookutils';

export default {
  title: "Base/Offline/Store",
  component: Component,
  decorators: [
    withAccounts(),
  ]
};

export const Store = {}
