import { ApplicationBaseState } from '@thecointech/shared/types';
import { AccountMapStore } from '@thecointech/redux-accounts';

// The app reducer is simply the site with accounts
export type ApplicationState = ApplicationBaseState & AccountMapStore;
