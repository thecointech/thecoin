import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { HarvestSchedule } from '@/types';
import { log } from '@thecointech/logging';

const TaskName = 'com.thecoin.harvester';
const PlistPath = `~/Library/LaunchAgents/${TaskName}.plist`;


export async function setSchedule(schedule: HarvestSchedule) {
  log.info(`Creating schedule: ${JSON.stringify(schedule)}`);

  try {
    // Unload existing schedule if it exists
    try {
      log.debug('Unloading existing schedule');
      execSync(`launchctl unload ${PlistPath}`);
    } catch (err) {
      // Ignore error if job doesn't exist
    }

    // Create new plist file
    const plist = generatePlist(schedule);
    const tmpName = `tc-sch-${Date.now()}`;
    const tmpPath = `${tmpdir()}/${tmpName}.plist`;

    log.debug(`Writing temp plist: ${tmpPath}`);
    writeFileSync(tmpPath, plist);

    // Move plist to LaunchAgents directory and load it
    execSync(`mkdir -p ~/Library/LaunchAgents`);
    execSync(`mv ${tmpPath} ${PlistPath}`);
    execSync(`launchctl load ${PlistPath}`);

    log.info('Schedule updated successfully');
  } catch (err) {
    log.error('Failed to set schedule:', err);
    throw err;
  }
}

function generatePlist(schedule: HarvestSchedule): string {
  const { daysToRun, timeToRun } = schedule;
  const [hour, minute] = timeToRun.split(':');

  // Convert days array to calendar days (0 = Sunday in our array, 1-7 in launchd)
  const weekdays = daysToRun
    .map((enabled, idx) => enabled ? ((idx + 1) % 7 || 7).toString() : null)
    .filter(Boolean)
    .join(',');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${TaskName}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${process.execPath}</string>
        <string>--harvest</string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
        ${weekdays.split(',').map(day => `
        <dict>
            <key>Hour</key>
            <integer>${hour}</integer>
            <key>Minute</key>
            <integer>${minute}</integer>
            <key>Weekday</key>
            <integer>${day}</integer>
        </dict>`).join('')}
    </array>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>~/Library/Logs/${TaskName}.log</string>
    <key>StandardErrorPath</key>
    <string>~/Library/Logs/${TaskName}.error.log</string>
</dict>
</plist>`;
}
