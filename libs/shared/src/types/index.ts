import type { MessageDescriptor } from 'react-intl';
import type { SidebarState } from '../containers/PageSidebar/types';
import type { FxRatesState } from '../containers/FxRate/types';
import type { LanguageBaseState } from '@thecointech/redux-intl';

// Your root reducer type, which is your redux state types also
// TODO: Rename to SharedBaseStore (more accurate name)
export interface ApplicationBaseState extends LanguageBaseState {
  readonly sidebar: SidebarState;
  readonly fxRates: FxRatesState;
}


// Allow passing values directly into MessageDescriptor
export type MessageWithValues = {
  values?: Record<string, any>
} & MessageDescriptor;
