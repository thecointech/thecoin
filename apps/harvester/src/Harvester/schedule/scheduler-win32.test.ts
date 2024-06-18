import { defaultDays, defaultTime } from '../../types'
import { getHarvesterExecutable, setSchedule } from './scheduler-win32'
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

  it ("finds the right executable", async () => {
    const executable = getHarvesterExecutable("C:\\Users\\UserName\\AppData\\Local\\harvester\\app-0.2.116\\harvester.exe,--process-start-args=--notify")
    expect(executable).toMatch(/harvester.exe/);
  })
}, IsManualRun)
