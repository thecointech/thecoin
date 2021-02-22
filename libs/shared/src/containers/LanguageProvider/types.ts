
export type Locale = "en"|"fr";
export type Messages = { [id: string]: string; };
export type Languages = {
  [locale in Locale]: Messages
};

export const DEFAULT_LOCALE: Locale = "en";

export interface LanguageProviderState {
  readonly locale: Locale;
}

/* --- ACTIONS --- */
export interface IActions {
  setLocale(locale: Locale): void;
}
