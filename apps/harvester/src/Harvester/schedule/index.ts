import { HarvestSchedule } from '../../types';
import { setSchedule as setScheduleLinux } from './scheduler-linux';
import { setSchedule as setScheduleWin32 } from './scheduler-win32';

export function setSchedule(schedule: HarvestSchedule, existing?: HarvestSchedule) {
  switch (process.platform) {
    case "linux":
      return setScheduleLinux(schedule, existing);
    case "win32":
      return setScheduleWin32(schedule, existing);
    default:
      throw new Error("Unsupported platform");
  }
}
