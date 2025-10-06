import { LoginDetails } from "./LoginDetails"
import { BankConnectReducer } from "./state/reducer"
import { BankType } from "./state/types";
import { QuestionResponse } from "./QuestionResponse";
import { useEffect } from "react";
import { useBackgroundTask } from '@/BackgroundTask';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import { Link } from "react-router-dom";
import type { AccountResponse } from "@thecointech/vqa";
import { log } from "@thecointech/logging";

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

    const results = parseResults(bgTask.result);
    if (both) {
      api.setCompleted('chequing', true, results);
      api.setCompleted('credit', true, results);
    }
    else {
      api.setCompleted(type, true, results);
    }
  }, [bgTask, both, type]);

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

const requiredParams: (keyof AccountResponse)[] = ['account_name', 'account_number', 'account_type', 'balance'];

const parseResults = (result?: string) => {
  if (!result) return;
  try {
    const results = JSON.parse(result) as AccountResponse[];
    if (!results?.length) {
      log.warn("No results found");
      return;
    }
    // Check required shape
    for (const result of results) {
      for (const p of requiredParams) {
        if (!result.hasOwnProperty(p)) {
          log.warn("Missing required parameter: " + p);
          return;
        }
      }
    }
    return results;
  }
  catch (e) {
    log.error({ err: e }, "Error parsing results");
    return;
  }
}
