import { gCloudDeploy, removeOldAppVersions, SetGCloudConfig } from "../../tools/predeploy";
import { predeploy } from "./predeploy";

await predeploy();
await SetGCloudConfig("GCLOUD_RATES_CONFIG");
await gCloudDeploy();
// Clean-up after
await removeOldAppVersions();

  // Don't forget to deploy our CRON file
  // if (process.env.SETTINGS != 'beta') {
  //   await ShellCmd("gcloud app deploy cron.yaml")
  // }

