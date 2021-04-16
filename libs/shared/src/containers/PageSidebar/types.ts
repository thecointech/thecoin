import { ImmerReducer } from 'immer-reducer';
import { ApplicationBaseState } from '../../types';
import { Dictionary } from 'lodash';
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

export type SidebarGenerators = {
  // sub generators run after, and may modify the
  // list (ie - by toggling items open/closed etc)
  generators: Dictionary<SidebarGenerator>;
}
//   readonly items: SidebarMenuItem[];
//   // We have a complex issue to resolve.  Our main page
//   // transition creates a new instance of it's children
//   // every change, which means that we reset menu
//   // items each frame.  If sub items are set before
//   // the items are reset, we lose them.  We work
//   // around this for now by manually keeping subitems,
//   // but we need to figure out a scheme where items
//   // are not reset every navigation.
//   readonly subParentName?: string;
//   readonly subItems?: SidebarMenuItem[];
//}

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
    if (element.link.to !== false) {
      const mapped: SidebarMenuItem = {
        link: {
          ...element.link,
          to: new RUrl(surl, element.link.to.toString()),
          icon: element.link.icon
        },
        subItems: element.subItems
          ? MapMenuItems(element.subItems, surl)
          : undefined
      };
      return mapped;
    }
    return element;
  });
}

/* --- ACTIONS --- */
export interface IActions extends ImmerReducer<SidebarGenerators> {
  addGenerator(name: string, generator: SidebarGenerator): void;
  removeGenerator(name: string): void;
}
