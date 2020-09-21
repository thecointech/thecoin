import { LanguageProviderReducer } from '../reducer';

describe('LanguageProviderReducer', () => {
  it('changes the locale', () => {
    expect(
      new LanguageProviderReducer().setLocale("fr"),
    ).toEqual({
      locale: 'fr',
    });
  });
});
