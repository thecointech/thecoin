import '@testing-library/jest-dom'
import React from 'react';
import { render } from '@testing-library/react';
import { FormattedMessage } from 'react-intl';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/redux';
import { Languages } from '../types';
import { LanguageProvider } from '../index';

const TestId = 'some.id'
const languages: Languages = {
  en: {
    [TestId]: 'The message in english',
  },
  fr: {
    [TestId]: 'Le message en francaise',
  }
};

type AppStore = ReturnType<typeof configureStore>

describe('LanguageProvider', () => {
  let store: AppStore;

  beforeEach(() => {
    store = configureStore();
  });

  it('should render the default language messages', () => {
    const { queryByText } = render(
      // tslint:disable-next-line: jsx-wrap-multiline
      <Provider store={store}>
        <LanguageProvider languages={languages}>
          <FormattedMessage id={TestId} />
        </LanguageProvider>
      </Provider>,
    );
    expect(
      queryByText(languages.en[TestId]),
    ).toBeInTheDocument();
  });
});
