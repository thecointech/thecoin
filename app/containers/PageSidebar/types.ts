import { ImmerReducer } from 'immer-reducer';

/* --- STATE --- */
export interface SidebarMenuLink {
  readonly name: string;
  readonly to: string;
}

export interface SidebarMenuItem {
  readonly link: SidebarMenuLink;
  readonly subItems?: SidebarMenuItem[];
}

interface ContainerState {
  readonly items: SidebarMenuItem[];
}

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  setItems(newItems: SidebarMenuItem[]): void;
  setSubItems(parent: SidebarMenuItem, subItems: SidebarMenuItem[]): void;
}

/* --- EXPORTS --- */

export { IActions, ContainerState };
