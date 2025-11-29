import { PrismicState } from 'components/Prismic/types';
import { AreaDatum } from 'containers/AreaGraph/types';

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState {
  readonly documents: PrismicState;

  // We store the current hover state in Redux to avoid
  // pushing the update through the react graph
  // (which causes a great many updates)
  readonly hovered: AreaDatum;
}
