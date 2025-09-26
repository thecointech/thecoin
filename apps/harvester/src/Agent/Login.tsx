import { LoginDetails } from "./LoginDetails"
import { BankConnectReducer } from "./state/reducer"
import { BankType } from "./state/types";
import { QuestionResponse } from "./QuestionResponse";
import { useEffect } from "react";
import { useBackgroundTask } from '@/BackgroundTask';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import { Link } from "react-router-dom";

type Props = {
  type: BankType;
  both?: boolean;
}
const Login = ({ type, both }: Props) => {
  const data = BankConnectReducer.useData();
  const api = BankConnectReducer.useApi();
  const bank = data[type];
  const bgTask = useBackgroundTask("record");

  useEffect(() => {
    if (!bgTask?.completed) return;

    if (both) {
      api.setCompleted('chequing', true);
      api.setCompleted('credit', true);
    }
    else {
      api.setCompleted(type, true);
    }
  }, [bgTask, api, both, type]);

  if (!bank) {
    return <div>ERROR: Bank type not found or selected: {type}</div>
  }

  return (
    <div>
      <LoginDetails {...bank} type={type} both={both}/>
      <QuestionResponse backgroundTaskId="record" />
      <BackgroundTaskProgressBar type="record" />
      <BackgroundTaskErrors type='record' />
      {
        both || type === 'credit' ? (
          <Link to="/config">Configure how the harvester will run</Link>
        ) : null
      }
    </div>
  )
}

export const LoginChequing = () => <Login type="chequing" />
export const LoginCredit = () => <Login type="credit" />
export const LoginBoth = () => <Login type="chequing" both />
