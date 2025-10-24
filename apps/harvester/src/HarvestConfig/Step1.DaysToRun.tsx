import { useEffect, useState } from 'react';
import { Checkbox, Container, Button, Icon, Message, Header } from 'semantic-ui-react';
import { ConfigReducer } from './state/reducer'
import { Info } from 'luxon';
import { DaysArray } from '@thecointech/store-harvester';

export const DaysToRun = () => {

  const { schedule } = ConfigReducer.useData();
  const api = ConfigReducer.useApi();

  return (
    <Container>
      <Header size="small">Schedule the days the harvester runs on</Header>
      <div>The harvester works best when it can cover the amount spent on your visa card quickly</div>
      <div>
        However, if you have limits on the number of e-transfers you can spend, or simply
        don't want the harvester running too frequently you can specify which days to run on.
        A recommended balance is to run on Tuesday and Friday.
      </div>
      <div>
        <label htmlFor="tod">Time to run:</label>
        <input id="tod" type='time' value={schedule.timeToRun} onChange={e => api.setTimeToRun(e.target.value)} />
      </div>
      <div>
        <DayToggle day={0} />
        <DayToggle day={1} />
        <DayToggle day={2} />
        <DayToggle day={3} />
        <DayToggle day={4} />
        <DayToggle day={5} />
        <DayToggle day={6} />
      </div>
      <EnableLingeringButton />
    </Container>
  )
}

const EnableLingeringButton = () => {

  if (process.env.BUILD_OS !== "linux") {
    return null;
  }
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scraper.hasUserEnabledLingering().then(res => {
      setEnabled(!!res.value);
    });
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    setError(null);
    const res = await window.scraper.enableLingeringForCurrentUser();
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setEnabled(true);
    }
  };

  if (enabled) {
    return <div style={{ marginTop: 16 }}><Icon name="check circle" color="green" />Lingering enabled</div>;
  }
  return (
    <div style={{ marginTop: 16 }}>
      <div>(Optional) For best results, enable the harvester to run even after you log out.</div>
      <div>This ensures the run is not interrupted by you logging out.</div>
      <Button loading={loading} disabled={loading} onClick={handleEnable}>
        Enable Lingering
      </Button>t
      {error && <Message negative>{error}</Message>}
    </div>
  );
}

type DayToggleProps = {
  day: number;
}
const DayToggle = ({day} : DayToggleProps) => {
  const { schedule } = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  return (
    <div>
      <Checkbox
        toggle
        checked={schedule.daysToRun[day]}
        label={Info.weekdays()[day]}
        onChange={(_, { checked }) => {
          const v = [...schedule.daysToRun] as DaysArray;
          v[day] = !!checked;
          api.setDaysToRun(v);
        }}
      />
    </div>
  )
}
