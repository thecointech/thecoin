import { SetGCloudConfig, copyEnvVarsLocal, copyNpmTokenHere, gCloudDeploy, ShellCmd, removeOldAppVersions } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_RATES_CONFIG");
  await copyEnvVarsLocal("app.secrets.yaml", { RUNTIME_ENV: "gcloud" });
  await copyNpmTokenHere(new URL(import.meta.url));
  await gCloudDeploy();
  // Clean-up after
  await removeOldAppVersions();

  // Don't forget to deploy our CRON file
  // if (process.env.SETTINGS != 'beta') {
  //   await ShellCmd("gcloud app deploy cron.yaml")
  // }
})();

