import { defaultDays } from '../../types'
import { setSchedule } from './scheduler'
import { describe, IsManualRun} from '@thecointech/jestutils';

describe('Scheduler', () => {
  it ('sets the schedule', async () => {

    await setSchedule(defaultDays);
    await setSchedule([true, false, true, false, true, false, false], defaultDays);

  })
}, IsManualRun)
