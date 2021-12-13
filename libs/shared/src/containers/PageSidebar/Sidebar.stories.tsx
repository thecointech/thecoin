import "@thecointech/site-semantic-theme/semantic.less"
import React from 'react';
import { Meta } from '@storybook/react';
import { PageSidebar, Props } from '.';
import { withStore, withReducer } from '@thecointech/storybookutils';
import ConstantSidebarItems from './Sidebar.stories.data.json';
import { SemanticICONS } from 'semantic-ui-react';
import { SidebarItemsReducer } from './reducer';
import { ApplicationBaseState } from '../../types';
import { SidebarState } from './types';

const header = ConstantSidebarItems.header;
const links = ConstantSidebarItems.links.map(l => ({
  ...l,
  icon: l.icon as SemanticICONS,
}))

type SidebarStore = ApplicationBaseState & {
  sidebar: SidebarState
}
export default {
  title: 'Shared/Sidebar',
  component: PageSidebar,
  args: {
    inverted: false,
    width: "wide",
  },
  argTypes: {
    width: {
      options: ['very thin', 'thin', 'wide', 'very wide'],
      control: { type: 'select' },
    }
  },
  decorators: [
    withReducer(SidebarItemsReducer),
    withStore<SidebarStore>({
      sidebar: {
        visible: true,
        items: {
          header: null,
          links,
        },
        generators: {
          header: (items) => ({
            ...items,
            header,
            visible: true,
          })
        }
      }
    })
  ]
} as Meta;

export const Sidebar = (args: Props) => <PageSidebar {...args} />
