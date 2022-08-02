import { SetGCloudConfig, copyEnvVarsLocal, copyNpmTokenHere, gCloudDeploy, removeOldAppVersions } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_BROKER_CONFIG");
  await copyEnvVarsLocal("app.secrets.yaml");
  await copyNpmTokenHere(new URL(import.meta.url));
  await gCloudDeploy();
  // Clean-up after
  await removeOldAppVersions();
})();

