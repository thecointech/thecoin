import { SiteBaseStore } from '@thecointech/site-base/SiteBaseStore';
import { ApplicationBaseState } from '@thecointech/shared/types';

// The app reducer is simply the site with accounts
export interface ApplicationRootState extends SiteBaseStore, ApplicationBaseState {}
