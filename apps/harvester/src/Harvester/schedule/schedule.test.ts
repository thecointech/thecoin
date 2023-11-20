import { defaultDays, defaultTime } from '../../types'
import { setSchedule } from './scheduler'
import { describe, IsManualRun} from '@thecointech/jestutils';

describe('Scheduler', () => {
  it ('sets the schedule', async () => {

    await setSchedule({ daysToRun: defaultDays, timeToRun: defaultTime} );
    await setSchedule(
      {
        daysToRun: [true, false, true, false, true, false, false],
        timeToRun: defaultTime,
      },
      {
        daysToRun: defaultDays,
        timeToRun: defaultTime,
      }
    )
  })
}, IsManualRun)
