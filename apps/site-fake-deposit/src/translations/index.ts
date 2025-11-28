// eslint-disable-next-line @typescript-eslint/no-var-requires
import { formatTranslations } from "@thecointech/redux-intl"

export const translations = formatTranslations({
  en: require('./en.json'),
  fr: require('./fr.json')
});
