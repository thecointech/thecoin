import { getTaskGroup, BackgroundTaskReducer } from "@/BackgroundTask";
import { BackgroundTaskProgressBar } from "@/BackgroundTask/BackgroundTaskProgressBar";
import { Button, Checkbox, Dropdown, Form, Label, Message } from "semantic-ui-react";
import { QuestionResponse } from "@/Agent/QuestionResponse";
import { useState } from "react";
import { ActionType } from "@/Harvester/scraper";

export function RefreshTwoFA() {

  const tasks = BackgroundTaskReducer.useData();
  const recordTask = getTaskGroup(tasks, 'twofaRefresh');
  const isWorking = !!recordTask && recordTask.completed !== true;
  const [accountType, setAccountType] = useState<ActionType>();
  const [refreshProfile, setRefreshProfile] = useState(true);
  const disabled = isWorking || !accountType;

  const refreshTwoFA = async () => {
    const r = await window.scraper.twofaRefresh(accountType!, refreshProfile);
    if (r.error) {
      alert(r.error);
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      If the harvester needs to pass the two-factor authentication, you can run this page to refresh the profile.
      <Form>
          <Dropdown
            placeholder="Choose Account to enter 2FA"
            fluid
            search
            selection
            options={[
              { key: 'chequing', text: 'Chequing', value: 'chqBalance' },
              { key: 'credit', text: 'Credit', value: 'visaBalance' },
            ]}
            onChange={(_, data) => setAccountType(data.value as ActionType)}
          />
      </Form>
      <Label>
        Refresh profile
        <Checkbox onChange={(_, data) => setRefreshProfile(!!data.checked)} checked={refreshProfile} />
        <Message>
          NOTE: Refreshing the profile removes the current harvester profile, which may require you to refresh two-factor authentication for both accounts.
        </Message>
      </Label>
      <Button onClick={refreshTwoFA} disabled={disabled}>Start</Button>
      <QuestionResponse isRecording={isWorking} />
      <BackgroundTaskProgressBar type="twofaRefresh" />
    </div>
  );
}
