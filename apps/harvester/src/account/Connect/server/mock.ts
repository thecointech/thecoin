import { sleep } from "@thecointech/async/sleep";
import { log } from "@thecointech/logging";
import { Wallet } from "ethers";
import { setCoinAccount } from "@/Harvester/config";
import { ConnectService } from "./state";

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
  const details = {
    address: wallet.address,
    name: "Development Wallet",
  }
  await setCoinAccount({
    ...details,
    encrypted,
    mnemonic: {
      phrase: wallet.mnemonic!.phrase,
      path: wallet.path!,
      locale: wallet.mnemonic!.wordlist!.locale,
    },
  })

  service.cb({ completed: true, percent: 100 });

  return details
}
