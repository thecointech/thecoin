import { log } from "@thecointech/logging";
import { RbcApi } from "@thecointech/rbcapi";
import { ConfigStore } from "@thecointech/store";

const OneDay = 24 * 60 * 60 * 1000;
const BankLastCheckKey = "bank.lastCheck";
export async function verifyBank(bank: RbcApi) {
  if (!process.env.ALWAYS_VERIFY_BANK) {
    const lastCheck = await ConfigStore.get(BankLastCheckKey);
    if (lastCheck && Number(lastCheck) > Date.now() - OneDay) {
      log.debug("Skipping Bank Check");
      return;
    }
  }

  const balance = await bank.getBalance();
  if (balance < 3000) {
    log.error(`Bank balance too low: ${balance}`);
  }
  else {
    log.debug(`Bank balance: ${balance}`);
  }
  await ConfigStore.set(BankLastCheckKey, Date.now().toString());
}
