

export const initialState = {
  activeAccount: undefined as string | undefined
};

export type AccountsState = Readonly<typeof initialState>;

export interface IAccountsActions {
  setActiveAccount(account: string): void;
};
