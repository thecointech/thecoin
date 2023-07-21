import { DaysArray } from '../../types';
import { log } from '@thecointech/logging';
import { DateTime, Info } from 'luxon';
import crypto from 'crypto';
import { tmpdir } from 'os';
import { unlinkSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const TaskName = "thecoin-harvest";
export async function setSchedule(schedule: DaysArray, existing?: DaysArray) {
  if (JSON.stringify(existing) == JSON.stringify(schedule)) {
    // no change
    return;
  }
  log.info(`Creating schedule: ${JSON.stringify(schedule)}`);

  try {
    log.debug(`Deleting existing schedule`);
    const r = execSync(`schtasks /delete /tn ${TaskName} /F`);
    log.debug(r.toString());
  }
  catch (err) {
    // no worries, it's already gone
  }

  try {
    // get a temp file
    const tmpName = `tc-sch-${crypto.randomBytes(16).toString('base64').replace(/\//,'_')}`;
    const xml = generateXml(schedule);
    const filepath = `${tmpdir()}/${tmpName}.xml`;
    log.debug(`Writing temp file: ${filepath}`);
    writeFileSync(filepath, xml);
    let success = false;
    const r = execSync(`schtasks /create /tn ${TaskName} /xml ${filepath}`);
    log.info(r.toString());
    log.debug(`Removing temp file: ${filepath}`);
    unlinkSync(filepath);
    log.info(`Schedule set`);
    return success;
  }
  catch (err) {
    if (err instanceof Error) {
      log.error(err, "Error setting schedule");
    }
    else {
      log.error(`"Error setting schedule: ${err}`);
    }
    throw err;
  }
}

const generateXml = (schedule: DaysArray) => {
  const daysToRun = schedule
    .map((d, idx) => d ? Info.weekdays('long')[idx] : null)
    .filter(d => !!d)

  return `<?xml version="1.0" encoding="UTF-16"?>
  <Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
    <RegistrationInfo>
      <Date>${DateTime.now().toString()}</Date>
      <URI>\\${TaskName}</URI>
    </RegistrationInfo>
    <Triggers>
      <CalendarTrigger>
        <StartBoundary>${DateTime.now().toSQLDate()}T9:00:00</StartBoundary>
        <Enabled>true</Enabled>
        <ScheduleByWeek>
          <DaysOfWeek>
            ${daysToRun.map(d => `<${d} />`).join('')}
          </DaysOfWeek>
          <WeeksInterval>1</WeeksInterval>
        </ScheduleByWeek>
      </CalendarTrigger>
    </Triggers>
    <Settings>
      <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
      <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
      <StopIfGoingOnBatteries>true</StopIfGoingOnBatteries>
      <AllowHardTerminate>true</AllowHardTerminate>
      <StartWhenAvailable>true</StartWhenAvailable>
      <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
      <IdleSettings>
        <StopOnIdleEnd>true</StopOnIdleEnd>
        <RestartOnIdle>false</RestartOnIdle>
      </IdleSettings>
      <AllowStartOnDemand>true</AllowStartOnDemand>
      <Enabled>true</Enabled>
      <Hidden>false</Hidden>
      <RunOnlyIfIdle>false</RunOnlyIfIdle>
      <WakeToRun>true</WakeToRun>
      <ExecutionTimeLimit>PT2H</ExecutionTimeLimit>
      <Priority>7</Priority>
    </Settings>
    <Actions Context="Author">
      <Exec>
        <Command>${process.argv0}</Command>
        <Arguments>--harvest</Arguments>
      </Exec>
    </Actions>
  </Task>`
}
