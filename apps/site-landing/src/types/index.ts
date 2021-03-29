import { SiteBaseStore } from '@thecointech/site-base/SiteBaseStore';
import { PrismicState } from 'components/Prismic/types';

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends SiteBaseStore {
  readonly documents: PrismicState;
}
