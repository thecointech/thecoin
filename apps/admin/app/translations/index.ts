// eslint-disable-next-line @typescript-eslint/no-var-requires
import { formatTranslations } from "@the-coin/site-base/containers/LanguageProvider/initialize"

export const translations = formatTranslations({
  en: require('./en.json'),
  fr: {} // Todo; how can we share translations with site/etc?
});
