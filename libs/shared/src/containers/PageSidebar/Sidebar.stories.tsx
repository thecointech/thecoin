import "@thecointech/site-semantic-theme/semantic.less"
import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { PageSidebar } from '.';
import { withStore, withReducer, withLanguageProvider } from '@thecointech/storybookutils';
import ConstantSidebarItems from './Sidebar.stories.data.json';
import { SemanticICONS } from 'semantic-ui-react';
import { SidebarItemsReducer } from './reducer';
import { ApplicationBaseState } from '../../types';
import { SidebarState } from './types';
import translations from "../../translations";

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
    visible: true,
    direction: "left"
  },
  argTypes: {
    width: {
      options: ['very thin', 'thin', 'wide', 'very wide'],
      control: { type: 'select' },
    },
    direction: {
      options: ["left", "top", "right", "bottom"],
      control: { type: 'select' },
    }
  },
  decorators: [
    withLanguageProvider(translations),
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

export const Sidebar = (args: any) => {
  const sidebar = SidebarItemsReducer.useApi();
  sidebar.setVisible(args.visible);
  return <PageSidebar {...args} />
}


