import { copyEnvVarsLocal, copyNpmTokenHere } from "../../tools/predeploy.ts";

(async () => {
  // await SetGCloudConfig("GCLOUD_RATES_CONFIG");
  await copyEnvVarsLocal(
    "app.secrets.yaml",
    { RUNTIME_ENV: "gcloud" },
    [
      // Required for updating oracle
      // "InfuraProjectId",
      // Required for emailing-on-error
      // "MailjetApiKey",
      // "MailjetApiSecret",
      // Required for Finhub
      // "FinhubApiKey",
      // Required for market-status
      // "TradierApiKey"
    ]
  );
  await copyNpmTokenHere(new URL(import.meta.url));
  // await gCloudDeploy();
  // // Clean-up after
  // await removeOldAppVersions();

  // Don't forget to deploy our CRON file
  // if (process.env.SETTINGS != 'beta') {
  //   await ShellCmd("gcloud app deploy cron.yaml")
  // }
})();

