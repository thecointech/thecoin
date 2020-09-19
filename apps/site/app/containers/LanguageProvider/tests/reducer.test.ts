import LanguageProviderReducer from '../reducer';

describe('LanguageProviderReducer', () => {
  it('returns the initial state', () => {
    expect(LanguageProviderReducer(undefined, {} as any)).toEqual({
      locale: 'en',
    });
  });

  it('changes the locale', () => {
    expect(
      LanguageProviderReducer(undefined, {
        type: ActionTypes.CHANGE_LOCALE,
        payload: 'de',
      }),
    ).toEqual({
      locale: 'de',
    });
  });
});
