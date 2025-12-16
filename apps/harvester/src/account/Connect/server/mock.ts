import { sleep } from "@thecointech/async/sleep";
import { log } from "@thecointech/logging";
import { Wallet } from "ethers";
import { setCoinAccount } from "@/Harvester/config";
import { ConnectService } from "./state";
import { toCoinAccount } from "@/account/convert";

export async function mockServer(service: ConnectService) {
  // Wait for 3 seconds, then mock it
  await sleep(1000);
  service.cb({percent: 25});

  await sleep(2000);
  service.cb({percent: 90});

  if (Math.random() < 0.33) {
    service.cb({ error: "Mocking some kind of error" });
    return;
  }
  const wallet = Wallet.createRandom();
  const encrypted = await wallet.encrypt("password");
  log.info({address: wallet.address}, "Creating new development wallet");
  const coinAccount = toCoinAccount(wallet, "Development Wallet");
  await setCoinAccount({
    ...coinAccount,
    encrypted,
  })

  service.cb({ completed: true, percent: 100 });

  return {
    address: wallet.address,
    name: "Development Wallet",
  }
}
