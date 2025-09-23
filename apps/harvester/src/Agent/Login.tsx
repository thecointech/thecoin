import { LoginDetails } from "./LoginDetails"
import { BankConnectReducer } from "./state/reducer"
import { BankType } from "./state/types";
import { QuestionResponse } from "./QuestionResponse";
import { useEffect } from "react";
import { useBackgroundTask } from '@/BackgroundTask';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";

type Props = {
  type: BankType;
  both?: boolean;
}
const Login = ({ type, both }: Props) => {
  const data = BankConnectReducer.useData();
  const api = BankConnectReducer.useApi();
  // const type = getProcessType("chequing", data);
  const bank = data[type];
  const bgTask = useBackgroundTask("record");

  useEffect(() => {
    if (bgTask?.completed) {
      api.setCompleted(type, true);
    }
  }, [bgTask]);
  return (
    <div>
      <LoginDetails {...bank!} type={type} both={both}/>
      <QuestionResponse backgroundTaskId="record" />
      <BackgroundTaskProgressBar type="record" />
      <BackgroundTaskErrors type='record' />
    </div>
  )
}

export const LoginChequing = () => <Login type="chequing" />
export const LoginCredit = () => <Login type="credit" />
export const LoginBoth = () => <Login type="chequing" both />
