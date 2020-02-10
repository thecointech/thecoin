import { useSelector } from "react-redux";
import { ApplicationBaseState } from "../../types";


export const makeAccountSelector = (address: string) => 
  (state: ApplicationBaseState) => state.accounts.map[address];

export const useSelectAccount = (address: string) => 
  useSelector(makeAccountSelector(address))