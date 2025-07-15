import { DaysArray } from '@/types';
import { generateService, generateTimer, getSystemdOnCalendar } from './scheduler-linux';

describe('scheduler-linux pure logic', () => {
  it('generates correct service unit', () => {
    const service = generateService();
    expect(service).toContain('[Unit]');
    expect(service).toContain('ExecStart=');
    expect(service).toContain('--harvest');
  });

  it('generates correct timer unit', () => {
    const schedule = { daysToRun: [true, false, false, false, false, false, false] as DaysArray, timeToRun: '12:34' };
    const timer = generateTimer(schedule);
    expect(timer).toContain('[Timer]');
    expect(timer).toContain('OnCalendar=Sun *-*-* 12:34:00');
  });

  it('translates schedule to OnCalendar', () => {
    const schedule = { daysToRun: [false, true, false, false, true, false, false] as DaysArray, timeToRun: '23:59' };
    const cal = getSystemdOnCalendar(schedule);
    expect(cal).toBe('Mon,Thu *-*-* 23:59:00');
  });
});

// it ('calculates a cron schedule', () => {
//     const s = getCronSchedule({
//         daysToRun: [false, true, false, false, true, false, false],
//         timeToRun: '23:59'
//     });
//     expect(s).toEqual('59 23 * * 1,4')
// })

// Do not run this test in CI
// if (process.platform === 'linux') {
//     it('creates a new job', async () => {
//         await setSchedule({
//             daysToRun: [false, true, false, false, true, false, false],
//             timeToRun: '23:59'
//         });
//     })
// }
