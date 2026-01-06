import { withLanguageProvider, withStore } from '@thecointech/storybookutils';
import translations from '../src/translations';

export const languageDecorator = [
    withLanguageProvider(translations),
    withStore(),
  ]
