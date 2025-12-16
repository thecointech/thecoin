import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { HarvestSchedule, toDayNames } from '@thecointech/store-harvester';
import { log } from '@thecointech/logging';
import { getScraperVisible } from '../scraperVisible';

const TaskName = 'thecoin-harvest';
const ServiceName = `${TaskName}.service`;
const TimerName = `${TaskName}.timer`;
const SystemdUserDir = `${homedir()}/.config/systemd/user`;
const ServicePath = `${SystemdUserDir}/${ServiceName}`;
const TimerPath = `${SystemdUserDir}/${TimerName}`;

// Manual run via:
// systemctl --user start thecoin-harvest.service

// Check if the timer is active and when it will run next
// systemctl --user status thecoin-harvest.timer

// List all timers and see when it last/next triggers
// systemctl --user list-timers thecoin-harvest.timer
export async function setSchedule(schedule: HarvestSchedule) {
  log.info(`Creating systemd schedule: ${JSON.stringify(schedule)}`);
  // Disable and stop the timer if it exists
  try {
    execSync(`systemctl --user disable --now ${TimerName}`);
  } catch (e) {
    // Ignore if timer wasn't enabled; log others for diagnostics
    log.debug(e, 'Ignoring error while disabling existing systemd timer');
  }

  // Just in case someone only wants to run manually.
  if (schedule.daysToRun.every(d => !d)) {
    log.info('No days selected, not creating schedule');
    return;
  }

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
  // Capture current display for fallback use
  // Don't override DISPLAY directly - systemd user manager keeps it current
  const currentDisplay = process.env.DISPLAY || ':0';

  const xvfbConfig = useXvfb ? `
ExecStartPre=/usr/bin/Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset
Environment=DISPLAY=:99
Environment=TC_REAL_DISPLAY=${currentDisplay}` : `
Environment=TC_REAL_DISPLAY=${currentDisplay}`;

  return `
[Unit]
Description=TheCoin Harvester Scheduled Job

[Service]
Type=simple${xvfbConfig}
ExecStart=${process.execPath} --harvest
RuntimeMaxSec=21600
TimeoutStopSec=30
KillMode=mixed
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
  // schedule.daysToRun: boolean[7] where 0=Sunday (JS Date.getDay() style)
  // schedule.timeToRun: 'HH:MM'
  const [hour, minute] = schedule.timeToRun.split(':');
  const hourNumber = parseInt(hour);
  const minuteNumber = parseInt(minute);
  if (
    !Number.isInteger(hourNumber)
    || !Number.isInteger(minuteNumber)
    || hourNumber < 0 || hourNumber > 23 || minuteNumber < 0 || minuteNumber > 59
  ) {
    throw new Error(`Invalid time values: ${hour}:${minute}`);
  }

  const days = toDayNames(schedule.daysToRun, "short", { locale: "en" });
  // We should have already bailed if no days are selected
  if (days.length === 0) {
    throw new Error('No days selected');
  }
  return `${days.join(',')} *-*-* ${hourNumber}:${minuteNumber}:00`;
}
