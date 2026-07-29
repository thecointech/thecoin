import { log } from "@thecointech/logging";
import { ConfigStore } from "@thecointech/store";
import { SendMail } from "@thecointech/email";
import { getAllHarvesterInstallations } from "@thecointech/broker-db";
import { DateTime } from "luxon";

const OneWeek = 7 * 24 * 60 * 60 * 1000;
const HarvesterMonitorLastCheckKey = "harvester.monitor.lastCheck";

const configuredPeriod = Number(process.env.HARVESTER_MONITOR_REPORT_PERIOD);
const MonitorReportPeriod =
  Number.isFinite(configuredPeriod) && configuredPeriod > 0
    ? configuredPeriod
    : OneWeek;

// const MonitorReportPeriod = process.env.HARVESTER_MONITOR_REPORT_PERIOD
//   ? parseInt(process.env.HARVESTER_MONITOR_REPORT_PERIOD)
//   : OneWeek;

// Weekly watchdog: if at least one run succeeded (or was legitimately
// skipped) for an installation in the past week, it's considered healthy.
// We deliberately don't run this more often - a single missed/failed run
// isn't actionable on its own, and the harvester's own per-run notifications
// (once wired up) cover anything more time-sensitive.
export async function monitorHarvest() {
  const lastCheck = await ConfigStore.get(HarvesterMonitorLastCheckKey);
  const lastCheckMs = lastCheck ? Number(lastCheck) : NaN;
  if (Number.isFinite(lastCheckMs) && lastCheckMs > Date.now() - MonitorReportPeriod) {
    log.debug({ lastCheck: DateTime.fromMillis(lastCheckMs).toSQL() }, "Harvester monitor skipped: last run {lastCheck}");
    return;
  }

  const cutoff = DateTime.now().minus({ weeks: 1 });
  const installations = await getAllHarvesterInstallations();

  const unhealthy = installations.filter(installation => {
    // Notification preference gates reporting, not tracking - an install
    // that opted out of notifications should never generate an alert.
    if (installation.notifyAction === "notifyNone") {
      return false;
    }
    // Grace period: don't flag installs that haven't had a chance to run yet
    if (installation.registeredAt > cutoff) {
      return false;
    }
    return !installation.lastHealthyAt || installation.lastHealthyAt < cutoff;
  });

  const healthy = installations.filter(installation => {
    return installation.lastHealthyAt && installation.lastHealthyAt >= cutoff;
  });

  const lines = unhealthy.map(installation => {
    const lastHealthy = installation.lastHealthyAt?.toISO() ?? "never";
    const failureStages = installation.lastFailureStages?.length
      ? `, failed steps: ${installation.lastFailureStages.join(", ")}`
      : "";
    return `- ${installation.address} / ${installation.installationId} `
      + `(${installation.platform ?? "unknown"}/${installation.architecture ?? "unknown"}): `
      + `last healthy ${lastHealthy}, last outcome ${installation.lastOutcome ?? "unknown"}${failureStages}`;
  });
  // Send a digest email every week.
  const prefix = process.env.CONFIG_NAME == "prod:test"
    ? "(prodtest) "
    : "";
  await SendMail(
    `${prefix}Harvester Monitor: ${unhealthy.length} installation(s) not reporting success`,
    `There were ${healthy.length} healthy installations and ${unhealthy.length} unhealthy installations.\n\n`
      + `The following harvester installations have not had a successful (or skipped) run in the past week:\n\n${lines.join("\n")}`
  );

  if (unhealthy.length > 0) {
    log.warn({ count: unhealthy.length }, "Harvester monitor found {count} unhealthy installation(s)");
  }
  else {
    log.debug("Harvester monitor: all installations healthy");
  }

  await ConfigStore.set(HarvesterMonitorLastCheckKey, Date.now().toString());
}
