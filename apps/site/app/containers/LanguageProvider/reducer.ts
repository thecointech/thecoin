/*
 *
 * LanguageProvider reducer
 *
 */
import ActionTypes from './constants';
import { DEFAULT_LOCALE } from '../../i18n';

export const initialState = {
  locale: DEFAULT_LOCALE,
};

export type ContainerState = Readonly<typeof initialState>;

type ActionType = { type: string; payload: string; }

function languageProviderReducer(
  state = initialState,
  action: ActionType,
): ContainerState {
  switch (action.type) {
    case ActionTypes.CHANGE_LOCALE:
      return {
        locale: action.payload,
      };
    default:
      return state;
  }
}
export default languageProviderReducer;
