import { ImmerReducer } from 'immer-reducer';

/* --- STATE --- */
export interface SidebarMenuLink {
  readonly name: string;
  readonly to: string | false;
}

export interface SidebarMenuItem {
  readonly link: SidebarMenuLink;
  readonly subItems?: SidebarMenuItem[];
}

export type SidebarMenuElement = SidebarMenuItem;
interface ContainerState {
  readonly items: SidebarMenuElement[];
  // We have a complex issue to resolve.  Our main page
  // transition creates a new instance of it's children
  // every change, which means that we reset menu
  // items each frame.  If sub items are set before
  // the items are reset, we lose them.  We work
  // around this for now by manually keeping subitems,
  // but we need to figure out a scheme where items
  // are not reset every navigation.
  readonly subParentName?: string;
  readonly subItems?: SidebarMenuElement[];
}

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setItems(newItems: SidebarMenuElement[]): void;
  setSubItems(parent: string, subItems: SidebarMenuItem[]): void;
}

/* --- EXPORTS --- */

export { IActions, ContainerState };
