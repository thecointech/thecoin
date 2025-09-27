// import { BankSelect } from './BankSelect';

import { SelectChequing } from "./SelectChequing"
import { SelectCredit } from "./SelectCredit"
import { BankConnectReducer } from "./state/reducer"
import { Routes } from "../SimplePath/types"
import { InitialState } from "./state/initialState"
import { LoginChequing, LoginCredit, LoginBoth } from "./Login"

export const routes: Routes<InitialState>[] = [
  {
    component: SelectChequing,
    title: "Select Chequing Bank",
    description: "Select your chequing bank",
    isComplete: (data) => !!data.chequing,
  },
  {
    component: SelectCredit,
    title: "Select Credit Bank",
    description: "Select your credit card bank",
    isComplete: (data) => !!data.credit,
  },
]

export const path = {
  groupKey: "agent",
  routes,
}


export const useBankConnectPaths = () => {
  const data = BankConnectReducer.useData();
  const r = {
    ...path,
  }
  r.routes = r.routes.concat(getLoginPages(data));
  return r;
}


// In the UI we always separate the chequing and credit
// banks, but in the process we can combine them
const getLoginPages = (data: InitialState) => {
  if (data.chequing && data.credit && data.chequing.url === data.credit.url) {
    return [LoginElement.both];
  }
  return [LoginElement.chequing, LoginElement.credit];
}

const LoginElement = {
  "chequing": {
    component: LoginChequing,
    title: "Login Chequing",
    description: "Connect your chequing account",
    isComplete: (data: InitialState) => !!data.chequing?.completed,
  },
  "credit": {
    component: LoginCredit,
    title: "Login Credit",
    description: "Connect your credit card account",
    isComplete: (data: InitialState) => !!data.credit?.completed,
  },
  "both": {
    component: LoginBoth,
    title: "Login",
    description: "Connect your accounts",
    isComplete: (data: InitialState) => !!data.chequing?.completed && !!data.credit?.completed,
  },
}
