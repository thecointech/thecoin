require("../../../tools/setenv");
import { getAllUsers, getAllActions } from "@thecointech/broker-db";
import { init } from "@thecointech/firestore";
import { writeFileSync } from 'fs';
import { cacheFile } from './load';

export async function fetch() {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.BROKER_SERVICE_ACCOUNT;
  await init();
  const users = await getAllUsers();
  const actions = await getAllActions(users);
  writeFileSync(cacheFile, JSON.stringify(actions, undefined, 2))
}

fetch();
