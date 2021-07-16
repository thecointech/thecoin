import { OfflineStore } from './Store';
import { withAccounts } from '@thecointech/storybookutils';

export default {
  title: "Base/Storage/Offline/Store",
  component: OfflineStore,
  decorators: [withAccounts()]
};

export const Store = {}
