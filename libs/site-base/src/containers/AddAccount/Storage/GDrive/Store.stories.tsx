import { GDriveStore } from './Store';
import { withAccounts } from '@thecointech/storybookutils';

export default {
  title: "Base/Storage/GDrive/Store",
  component: GDriveStore,
  decorators: [withAccounts()]
};

export const Store = {}
