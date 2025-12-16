// import { BankSelect } from './BankSelect';

import { SelectChequing } from "./SelectChequing"
import { SelectCredit } from "./SelectCredit"
import { BankConnectReducer } from "./state/reducer"
import { Routes } from "../SimplePath/types"
import { InitialState } from "./state/initialState"
import { LoginChequing, LoginCredit, LoginBoth } from "./Login"
import { VerifyAccounts } from "./VerifyAccounts/VerifyAccounts"

export const groupKey = "agent";

export const routes: Routes<InitialState>[] = [
  {
    component: SelectChequing,
    path: "chequing",
    title: "Select Chequing Bank",
    description: "Select your chequing bank",
    isComplete: (data) => !!data.banks.chequing,
  },
  {
    component: SelectCredit,
    path: "credit",
    title: "Select Credit Bank",
    description: "Select your credit card bank",
    isComplete: (data) => !!data.banks.credit,
  },
  {
    path: "loginChequing",
    component: LoginChequing,
    title: "Login Chequing",
    description: "Connect your chequing account",
    isComplete: (data: InitialState) => !!data.banks.chequing?.completed,
  },
  {
    path: "loginCredit",
    component: LoginCredit,
    title: "Login Credit",
    description: "Connect your credit card account",
    isComplete: (data: InitialState) => !!data.banks.credit?.completed,
  },
  {
    path: "loginBoth",
    component: LoginBoth,
    title: "Login",
    description: "Connect your accounts",
    isComplete: (data: InitialState) => !!data.banks.chequing?.completed && !!data.banks.credit?.completed,
  },
  {
    path: "verifyAccounts",
    component: VerifyAccounts,
    title: "Verify Accounts",
    description: "Verify your accounts",
    isComplete: (data) => !!data.stored,
  }
]

export const path = {
  groupKey,
  routes,
}

export const useBankConnectPaths = () => {
  const data = BankConnectReducer.useData();
  const r = {
    ...path,
  }
  r.routes = filterLoginPages(r.routes, data);
  return r;
}


// In the UI we always separate the chequing and credit
// banks, but in the process we can combine them
const filterLoginPages = (routes: Routes<InitialState>[], data: InitialState) => {
  // by default we show both.  The only time we don't is
  // if the chequing and credit both exist & are to different banks
  const both = !(
    data.banks.chequing?.url
    && data.banks.credit?.url
    && data.banks.chequing.url !== data.banks.credit.url
  )

  return routes.filter(route => {
    // Show both unless
    if (route.path === "loginBoth") return both;
    if (route.path === "loginChequing") return !both;
    if (route.path === "loginCredit") return !both;
    return true;
  })
}

// const LoginElement = {
//   "chequing": {
//     component: LoginChequing,
//     title: "Login Chequing",
//     description: "Connect your chequing account",
//     isComplete: (data: InitialState) => !!data.banks.chequing?.completed,
//   },
//   "credit": {
//     component: LoginCredit,
//     title: "Login Credit",
//     description: "Connect your credit card account",
//     isComplete: (data: InitialState) => !!data.banks.credit?.completed,
//   },
//   "both": {
//     component: LoginBoth,
//     title: "Login",
//     description: "Connect your accounts",
//     isComplete: (data: InitialState) => !!data.banks.chequing?.completed && !!data.banks.credit?.completed,
//   },
// }
