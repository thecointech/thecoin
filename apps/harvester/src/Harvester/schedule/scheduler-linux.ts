import { load, type CronTab } from 'crontab';
import { HarvestSchedule } from '../../types';
import { log } from '@thecointech/logging';

const TaskName = "thecoin-harvest";

export async function setSchedule(schedule: HarvestSchedule, _existing?: HarvestSchedule) {
  
  const cronSchedule = getCronSchedule(schedule);
  log.info(`Creating schedule: ${cronSchedule}`);
  
  const crontab = await getCrontab();
  const jobs = crontab.jobs({
    comment: TaskName,
  });
  
  if (jobs.length > 0) {
    log.info(`Deleting existing schedule`);
    crontab.remove(jobs[0]);
  }

  const runCmd = `${process.execPath} --harvest`;
  crontab.create(runCmd, cronSchedule, TaskName);
  await saveCrontab(crontab);

  log.info('Schedule updated');
}

export const getCronSchedule = (schedule: HarvestSchedule) => {
  const [hours, minutes] = schedule.timeToRun.split(':');
  const days = schedule.daysToRun
    .map((day, index) => day ? index : undefined)
    .filter(day => day !== undefined)
    .join(',');
  return `${minutes} ${hours} * * ${days}`;
}

const getCrontab = () => new Promise<CronTab>((resolve, reject) => {
  load((err, crontab) => {
    if (err?.message) {
      log.error("Error loading crontab: " + err.message);
      reject(err);
      return;
    }
    resolve(crontab);
  });
})

const saveCrontab = (crontab: CronTab) => new Promise<void>((resolve, reject) => {
  crontab.save(err => {
    if (err?.message) {
      log.error("Error saving crontab: " + err.message);
      reject(err);
      return;
    }
    resolve();
  });
})