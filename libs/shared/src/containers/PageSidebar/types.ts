import { ImmerReducer } from 'immer-reducer';
import { ApplicationBaseState } from '../../types';
import { Dictionary } from 'lodash';

/* --- STATE --- */
export interface SidebarMenuLink {
  name: string;
  to: string | false;
}

export interface SidebarMenuItem {
  link: SidebarMenuLink;
  subItems?: SidebarMenuItem[];
}

// Sidebar does not directly recieve state: instead;
// we recieve a generator that transfors App State
// into the appropriate sidebar objects
export type ItemGenerator = (state: ApplicationBaseState) => SidebarMenuItem[];
export type ItemModifier = (items: SidebarMenuItem[], state: ApplicationBaseState) => SidebarMenuItem[];


export type SidebarGenerators = {
  // A root generator runs before the rest of them
  rootGenerator: ItemGenerator|null;
  // sub generators run after, and may modify the
  // list (ie - by toggling items open/closed etc)
  subGenerators: Dictionary<ItemModifier>;
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
          to: `${surl}/${element.link.to}`,
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
  addGenerator(name: string, generator: ItemModifier): void;
  removeGenerator(name: string): void;
  setRootGenerator(generator: ItemGenerator|null): void;
}
