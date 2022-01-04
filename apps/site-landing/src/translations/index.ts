// eslint-disable-next-line @typescript-eslint/no-var-requires
import { formatTranslations } from "@thecointech/shared/containers/LanguageProvider/initialize"

import en from './en.json';
import fr from './en.json';
import shared from "@thecointech/shared/translations";

export const translations = formatTranslations({
  en: {
    ...shared.en,
    ...en,
  },
  fr: {
    ...shared.fr,
    ...fr,
  }
});
