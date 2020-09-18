/* --- STATE --- */
export interface ContentState {
    readonly locale: string;
  }
  
  /* --- ACTIONS --- */
  export interface IActions {
    setLocale(locale: string): void;
  }