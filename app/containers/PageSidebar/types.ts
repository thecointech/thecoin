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
}

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setItems(newItems: SidebarMenuElement[]): void;
  setSubItems(parent: SidebarMenuItem, subItems: SidebarMenuItem[]): void;
}

/* --- EXPORTS --- */

export { IActions, ContainerState };
