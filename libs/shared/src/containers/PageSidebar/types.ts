import { MessageDescriptor } from 'react-intl';
import { SemanticICONS } from 'semantic-ui-react';
import { SidebarHeader } from './SidebarHeader';

/* --- STATE --- */
export type SidebarHeader = {
  // Almost always the word 'Profile'
  title: MessageDescriptor;
  // Link to avatar to be displayed
  avatar: string;
  // Whatever the user has decided to name their account
  accountName: string;
  // The users address
  address: string;
}
export type SidebarLink = {
  name: MessageDescriptor;
  to: string | boolean;
  subItems?: SidebarLink[];
  icon?: SemanticICONS;
}

export type SidebarMenuItems = {
  header: SidebarHeader|null,
  links: SidebarLink[];
}

// Sidebar does not directly recieve state: instead;
// we recieve a generator that transfors App State
// into the appropriate sidebar objects
export type SidebarGenerator = (items: SidebarMenuItems) => SidebarMenuItems;


export type SidebarState = {
  readonly items: SidebarMenuItems;

  // sub generators run after, and may modify the
  // list (ie - by toggling items open/closed etc)
  generators: Record<string, SidebarGenerator>;

  // Is the sidebar currently displayed?
  // Can be toggled off by pages that do not want a sidebar
  visible: boolean;
}

////////////////////////////////////////////////////////////////
// Utility Functions
// Search through items to find the named entity
export function FindItem(items: SidebarLink[], name: string) {
  return items.find(item => item.name === name);
}

/* --- ACTIONS --- */
export interface IActions {
  addGenerator(name: string, generator: SidebarGenerator): void;
  removeGenerator(name: string): void;

  setHeader(header: SidebarHeader): void;
  setVisible(visible: boolean): void;
}
