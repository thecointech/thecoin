import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';
import { homedir, tmpdir } from 'os';
import { HarvestSchedule } from '@/types';
import { log } from '@thecointech/logging';
import { parseTime } from './common';

const TaskName = 'com.thecoin.harvester';
const HomeDir = homedir();
const PlistDir = `${HomeDir}/Library/LaunchAgents`;
const PlistPath = `${PlistDir}/${TaskName}.plist`;


export async function setSchedule(schedule: HarvestSchedule) {
  log.info(`Creating schedule: ${JSON.stringify(schedule)}`);

  try {
    // Unload existing schedule if it exists
    try {
      log.debug('Unloading existing schedule');
      execSync(`launchctl unload "${PlistPath}"`);
    } catch (err) {
      // Ignore error if job doesn't exist
    }

    // If no days are selected, there is no schedule to set
    if (!schedule.daysToRun.some(Boolean)) {
      log.warn('No days selected for schedule');
      return;
    }

    // Create new plist file
    const plist = generatePlist(schedule);
    const tmpName = `tc-sch-${Date.now()}`;
    const tmpPath = `${tmpdir()}/${tmpName}.plist`;

    log.debug(`Writing temp plist: ${tmpPath}`);
    writeFileSync(tmpPath, plist);

    // Move plist to LaunchAgents directory and load it
    mkdirSync(PlistDir, { recursive: true });
    try {
      copyFileSync(tmpPath, PlistPath);
    } finally {
      try {
        unlinkSync(tmpPath);
      } catch (err) {
        log.warn('Failed to remove temp plist:', err);
      }
    }
    execSync(`launchctl load "${PlistPath}"`);

    log.info('Schedule updated successfully');
  } catch (err) {
    log.error('Failed to set schedule:', err);
    throw err;
  }
}

function generatePlist(schedule: HarvestSchedule): string {
  const { daysToRun, timeToRun } = schedule;
  const { hour, minute } = parseTime(timeToRun);

  // Convert days array to calendar days (0 = Sunday in both our array and launchd)
  const weekdays = daysToRun
    .map((enabled, idx) => enabled ? idx : null)
    .filter((v): v is number => v !== null)

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
        ${weekdays.map(day => `
        <dict>
            <key>Hour</key>
            <integer>${hour}</integer>
            <key>Minute</key>
            <integer>${minute}</integer>
            <key>Weekday</key>
            <integer>${day}</integer>
        </dict>`).join('')}
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>HOME</key>
        <string>${HomeDir}</string>
    </dict>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>${HomeDir}/Library/Logs/${TaskName}.log</string>
    <key>StandardErrorPath</key>
    <string>${HomeDir}/Library/Logs/${TaskName}.error.log</string>
</dict>
</plist>`;
}
