import { SetGCloudConfig, copyEnvVarsLocal, copyNpmTokenHere, gCloudDeploy, removeOldAppVersions } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_NFT_SERVICE_CONFIG");
  await copyEnvVarsLocal("app.secrets.yaml", { RUNTIME_ENV: "gcloud" });
  await copyNpmTokenHere(new URL(import.meta.url));
  await gCloudDeploy();
  // Clean-up after
  await removeOldAppVersions();
})();

