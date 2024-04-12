import { getSigner } from '@thecointech/signers';
import { DateTime, Duration } from 'luxon';

async function getDevLiveArguments() {
  // NOTE: These values have been copy-pasted from rates-service seed file
  const updater = await getSigner("OracleUpdater");
  const from = DateTime
  .local()
  .minus({ years: 1.5 })
  .setZone("America/New_York")
  .set({
    hour: 9,
    minute: 31,
    second: 30,
    millisecond: 0
  });
  const blockDuration = Duration.fromObject({ days: 1 });
  return [
    await updater.getAddress(),
    from.toMillis(),
    blockDuration.as("milliseconds"),
  ]
}

async function getProductionArguments() {
  if (!process.env.WALLET_OracleUpdater_ADDRESS) throw new Error("WALLET_OracleUpdater_ADDRESS must be set");
  if (!process.env.ORACLE_INITIAL_TIMESTAMP) throw new Error("ORACLE_INITIAL_TIMESTAMP must be set");
  if (!process.env.ORACLE_BLOCK_DURATION) throw new Error("ORACLE_BLOCK_DURATION must be set");

  return [
    process.env.WALLET_OracleUpdater_ADDRESS,
    parseInt(process.env.ORACLE_INITIAL_TIMESTAMP),
    parseInt(process.env.ORACLE_BLOCK_DURATION),
  ]
}

export const getArguments = () =>
  process.env.NODE_ENV !== "production"
  ? getDevLiveArguments()
  : getProductionArguments();

