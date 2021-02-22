// eslint-disable-next-line @typescript-eslint/no-var-requires
import { formatTranslations } from "@the-coin/shared/containers/LanguageProvider/initialize"

export const translations = formatTranslations({
  en: require('./en.json'),
  fr: require('./fr.json')
});
