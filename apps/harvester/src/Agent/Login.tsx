import { LoginDetails } from "./LoginDetails"
import { BankConnectReducer } from "./state/reducer"
import { RendererBankType } from "./state/types";
import { QuestionResponse } from "./QuestionResponse";
import { useEffect, useState } from "react";
import { useBackgroundTask } from '@/BackgroundTask';
import { BackgroundTaskErrors, BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import type { AccountResponse } from "@thecointech/vqa";
import { log } from "@thecointech/logging";
import { Icon, Message } from "semantic-ui-react";

type Props = {
  type: RendererBankType;
  both?: boolean;
}
const Login = ({ type, both }: Props) => {
  const data = BankConnectReducer.useData();
  const api = BankConnectReducer.useApi();
  const bank = data.banks[type];
  const bgTask = useBackgroundTask("record");
  const [hasDetails, setHasDetails] = useState<boolean>();

  useEffect(() => {
    window.scraper.getCoinAccountDetails()
    .then((r) => {
      if (r.error) {
        log.error({error: r.error}, "Error loading bank details: {error}")
      }
      setHasDetails(!!r.value);
    })
  }, []);

  useEffect(() => {
    if (!bgTask?.completed) return;

    const results = parseResults(bgTask.result);
    if (!results) {
      alert("Agent run yielded no results");
      return;
    }
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

  const missingDetails = hasDetails === false;

  return (
    <div>
      {
        missingDetails && (
          <Message error>
            No Coin account found<Icon name="warning" /><br />
            Please connect to TheCoin account before connecting to your bank.
          </Message>
        )
      }
      <LoginDetails {...bank} type={type} both={both} disabled={missingDetails}/>
      <QuestionResponse backgroundTaskId="record" />
      <BackgroundTaskProgressBar type="record" />
      <BackgroundTaskErrors type='record' />
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
