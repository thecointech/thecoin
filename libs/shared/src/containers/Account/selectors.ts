import { IsValidAddress } from "@thecointech/utilities";
import { AccountMapStore } from "../AccountMap";
import { useSelector } from "react-redux";


// Select specific account
export const makeAccountSelector = (address: string) =>
  (state: AccountMapStore) =>
    IsValidAddress(address)
      ? state.accounts.map[address]
      : undefined;

export const useAccount = (address: string) =>
  useSelector(makeAccountSelector(address))
