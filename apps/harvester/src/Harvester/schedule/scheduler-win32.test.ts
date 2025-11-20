import { defaultTime, toDaysArray, DayOfWeek } from '@thecointech/store-harvester'
import { getHarvesterExecutable, generateXml } from './scheduler-win32'
import { describe, IsManualRun} from '@thecointech/jestutils';

it ('generates the schedule', async () => {

  const days = toDaysArray(DayOfWeek.Monday, DayOfWeek.Wednesday)
  const xml = generateXml(days, defaultTime);
  expect(xml).toContain('Monday');
  expect(xml).toContain('Wednesday');
  expect(xml).toContain(defaultTime);
})

describe('Scheduler', () => {
  it ("finds the right executable", async () => {
    const executable = getHarvesterExecutable("C:\\Users\\UserName\\AppData\\Local\\harvester\\app-0.2.116\\harvester.exe,--process-start-args=--notify")
    expect(executable).toMatch(/harvester.exe/);
  })
}, IsManualRun)
