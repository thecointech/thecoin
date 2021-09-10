import { SetGCloudConfig, copyEnvVarsLocal, copyNpmTokenHere, gCloudDeploy, ShellCmd, removeOldAppVersions } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_RATES_CONFIG");
  await copyEnvVarsLocal("app.secrets.yaml");
  await copyNpmTokenHere(__dirname);
  await gCloudDeploy();
  // Clean-up after
  await removeOldAppVersions();

  // Don't forget to deploy our CRON file
  // if (process.env.SETTINGS != 'beta') {
  //   await ShellCmd("gcloud app deploy cron.yaml")
  // }
})();

