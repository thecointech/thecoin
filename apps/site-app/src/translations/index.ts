import { formatTranslations } from "@thecointech/redux-intl"
import en from './en.json';
import fr from './fr.json';
import shared from "@thecointech/shared/translations";
import base from "@thecointech/site-base/translations";

export const translations = formatTranslations({
  en: {
    ...shared.en,
    ...base.en,
    ...en,
  },
  fr: {
    ...shared.fr,
    ...base.fr,
    ...fr,
  }
});
