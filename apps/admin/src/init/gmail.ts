import { initialize } from '@thecointech/tx-gmail';
import { ConfigStore } from '@thecointech/store';

export async function initGmail() {
  const token = await ConfigStore.get("gmailcred")
  const newtoken = await initialize(token)
  ConfigStore.set("gmailcred", newtoken);
}
