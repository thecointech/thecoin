import { HarvestSchedule } from '../../types';
import { setSchedule as setScheduleLinux } from './scheduler-linux';
import { setSchedule as setScheduleWin32 } from './scheduler-win32';
import { setSchedule as setScheduleDarwin } from './scheduler-darwin';
import { log } from '@thecointech/logging';

export function setSchedule(schedule: HarvestSchedule) {
  // Don't schedule if we're in dev mode
  if (process.env.NODE_ENV === 'development') {
    log.debug("Skipping setSchedule in dev mode");
    return;
  }

  switch (process.platform) {
    case "linux":
      return setScheduleLinux(schedule);
    case "win32":
      return setScheduleWin32(schedule);
    case "darwin":
      return setScheduleDarwin(schedule);
    default:
      throw new Error("Unsupported platform");
  }
}
