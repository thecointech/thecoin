
/* --- STATE --- */
export interface ContentState {
  readonly height: number;
}

/* --- ACTIONS --- */
export interface IActions {
  setHeight(newHeight: number, timestamp: number): void;
}