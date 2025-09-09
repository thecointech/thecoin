import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { HarvestSchedule } from '../../types';
import { log } from '@thecointech/logging';
import { getScraperVisible } from '../scraperVisible';

const TaskName = 'thecoin-harvest';
const ServiceName = `${TaskName}.service`;
const TimerName = `${TaskName}.timer`;
const SystemdUserDir = `${homedir()}/.config/systemd/user`;
const ServicePath = `${SystemdUserDir}/${ServiceName}`;
const TimerPath = `${SystemdUserDir}/${TimerName}`;

export async function setSchedule(schedule: HarvestSchedule, _existing?: HarvestSchedule) {
  log.info(`Creating systemd schedule: ${JSON.stringify(schedule)}`);
  try {
    // Ensure systemd user dir exists
    mkdirSync(SystemdUserDir, { recursive: true });

    // Check if scraper should run visible (requiring Xvfb)
    const scraperVisible = await getScraperVisible();

    // Write service and timer files
    const serviceContent = generateService(scraperVisible);
    const timerContent = generateTimer(schedule);
    writeFileSync(ServicePath, serviceContent);
    writeFileSync(TimerPath, timerContent);

    // Reload systemd user units
    execSync('systemctl --user daemon-reload');

    // Disable and stop the timer if it exists
    try {
      execSync(`systemctl --user disable --now ${TimerName}`);
    } catch (e) {
      // Ignore if timer wasn't enabled
    }

    // Enable and start the timer
    execSync(`systemctl --user enable --now ${TimerName}`);
    execSync(`systemctl --user daemon-reload`);
    execSync(`systemctl --user restart ${TimerName}`);
    log.info('Systemd schedule updated successfully');
  } catch (err) {
    log.error(err, 'Failed to set systemd schedule');
    throw err;
  }
}

export function generateService(useXvfb: boolean = false): string {
  const xvfbConfig = useXvfb ? `
ExecStartPre=/usr/bin/Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset
Environment=DISPLAY=:99` : '';

  return `
[Unit]
Description=TheCoin Harvester Scheduled Job

[Service]
Type=simple${xvfbConfig}
ExecStart=${process.execPath} --harvest
`; // Add more options as needed
}

export function generateTimer(schedule: HarvestSchedule): string {
  return `
[Unit]
Description=TheCoin Harvester Timer

[Timer]
OnCalendar=${getSystemdOnCalendar(schedule)}
Persistent=true

[Install]
WantedBy=timers.target
`;
}

// Converts HarvestSchedule to systemd OnCalendar format
export function getSystemdOnCalendar(schedule: HarvestSchedule): string {
  // schedule.daysToRun: boolean[7] where 0=Sunday
  // schedule.timeToRun: 'HH:MM'
  const [hour, minute] = schedule.timeToRun.split(':');
  const days = schedule.daysToRun
    .map((enabled, idx) => enabled ? idx : null)
    .filter(idx => idx !== null) as number[];
  if (days.length === 0) return `*-${hour}:${minute}`; // fallback: every day
  // systemd: 0=Sun, 1=Mon, ..., 6=Sat
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStr = days.map(d => dayMap[d]).join(',');
  return `${dayStr} *-*-* ${hour}:${minute}:00`;
}
