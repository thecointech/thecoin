import { ApplicationBaseState } from '../../types';
import { RUrl } from '@thecointech/utilities/RUrl';
import { SemanticICONS } from 'semantic-ui-react';

/* --- STATE --- */
export interface SidebarMenuLink {
  name: string;
  to: RUrl | boolean;
  icon?: SemanticICONS;
  header?: { avatar: string, primaryDescription: string, secondaryDescription: JSX.Element | Element | string };
}

export interface SidebarMenuItem {
  link: SidebarMenuLink;
  subItems?: SidebarMenuItem[];
  icon?: SemanticICONS;
  header?: { avatar: string, primaryDescription: string, secondaryDescription: JSX.Element | Element | string };
}

// Sidebar does not directly recieve state: instead;
// we recieve a generator that transfors App State
// into the appropriate sidebar objects
export type SidebarGenerator = (items: SidebarMenuItem[], state: ApplicationBaseState) => SidebarMenuItem[];

export type SidebarState = {
  readonly items: SidebarMenuItem[];

  // sub generators run after, and may modify the
  // list (ie - by toggling items open/closed etc)
  generators: Record<string, SidebarGenerator>;
}

////////////////////////////////////////////////////////////////
// Utility Functions
// Search through items to find the named entity
export function FindItem(items: SidebarMenuItem[], name: string) {
  return items.find(item => item.link.name === name);
}

const stripTrailingSlash = (str: string) : string => {
  return str.endsWith('/') ?
      str.slice(0, -1) :
      str;
};

export function MapMenuItems(item: SidebarMenuItem[], url: string): SidebarMenuItem[] {
  let surl = stripTrailingSlash(url);
  return item.map(element => {
    const mapped: SidebarMenuItem = {
      link: {
        ...element.link,
        to: element.link.to ? new RUrl(surl, element.link.to.toString()) : false,
        icon: element.link.icon
      },
      subItems: element.subItems
        ? MapMenuItems(element.subItems, surl)
        : undefined
    };
    return mapped;
  });
}

/* --- ACTIONS --- */
export interface IActions {
  addGenerator(name: string, generator: SidebarGenerator): void;
  removeGenerator(name: string): void;
}
