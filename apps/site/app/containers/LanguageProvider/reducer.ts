/*
 *
 * LanguageProvider reducer
 *
 */
//import ActionTypes from './constants';
import { DEFAULT_LOCALE } from '../../i18n';
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/utils/immerReducer'
import { ContentState, IActions } from './types';
import { ApplicationRootState } from 'types';
import { useInjectReducer } from 'redux-injectors';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';


export const initialState = {
  locale: DEFAULT_LOCALE,
};
const CONTENT_KEY : keyof ApplicationRootState = "content";

class LanguageProviderReducer extends TheCoinReducer<ContentState>
  implements IActions {
    setLocale(locale: string) {
      //I don't think I need the timestamps used in ContentHeight: tell me if i am wrong
      // I need to add locale to the drafstate: DONE
      // setLocale needs to be checked/changed/added in index.tsx (TODO) and types.ts (DONE)
      this.draftState.locale = locale;
    }
}

export const useLanguageProvider = () => {
  const { reducer, actions } = GetNamedReducer(LanguageProviderReducer, CONTENT_KEY, initialState);
  useInjectReducer({ key: CONTENT_KEY, reducer });
  return (bindActionCreators(actions, useDispatch()) as any) as IActions;
}

/*
----OLD CODE---

export type ContainerState = Readonly<typeof initialState>;

type ActionType = { type: string; payload: string; }

function languageProviderReducer( state = initialState, action: ActionType,
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

*/


