
export type Locale = "en"|"fr";
export type Messages = { [id: string]: string; };
export type Languages = {
  [locale in Locale]: Messages
};

export interface LanguageProviderState {
  readonly locale: Locale;
}

// Type to be merged with ApplicationBaseState
export interface LanguageBaseState {
  readonly language: LanguageProviderState;
}

/* --- ACTIONS --- */
export interface IActions {
  setLocale(locale: Locale): void;
}
