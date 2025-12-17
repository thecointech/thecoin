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
