import { Checkbox, Container } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer'
import { Info } from 'luxon';
import { DaysArray } from '../types';

export const DaysToRun = () => {

  return (
    <Container>
      <h4>Schedule the days the harvester runs on</h4>
      <div>The harvester works best when it can cover the amount spent on your visa card quickly</div>
      <div>
        However, if you have limits on the number of e-transfers you can spend, or simply
        don't want the harvester running too frequently you can specify which days to run on.
        A recommended balance is to run on Tuesday and Friday.
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
    </Container>
  )
}

type DayToggleProps = {
  day: number;
}
const DayToggle = ({day} : DayToggleProps) => {
  const data = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  return (
    <div>
      <Checkbox
        toggle
        checked={data.daysToRun[day]}
        label={Info.weekdays()[day]}
        onChange={(_, { checked }) => {
          const v = [...data.daysToRun] as DaysArray;
          v[day] = !!checked;
          api.setDaysToRun(v);
        }}
      />
    </div>
  )
}
