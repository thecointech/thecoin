import { RestoreList } from './RestoreList';
import { withAccounts } from '@thecointech/storybookutils';

export default {
  title: "Base/Storage/GDrive/List",
  component: RestoreList,
  decorators: [withAccounts()]
};

export const List = {
  args: {
    url: '?token=MockedCode'
  }
}
