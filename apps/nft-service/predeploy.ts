import { SetGCloudConfig, copyEnvVarsLocal } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_NFTSERVICE_CONFIG"));
  console.log(await copyEnvVarsLocal("app.secrets.yaml"));
})();

