import { SiteBaseStore } from '@the-coin/site-base/SiteBaseStore';
import { ApplicationBaseState } from '@the-coin/shared/types';

// The app reducer is simply the site with accounts
export interface ApplicationRootState extends SiteBaseStore, ApplicationBaseState {}
