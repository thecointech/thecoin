import { selectLocale } from '../selector';

describe('selectLanguage', () => {
  it('should select the global state', () => {
    const globalState = {};
    const mockedState: any = {
      language: globalState,
    };
    expect(selectLocale(mockedState)).toEqual(globalState);
  });
});
