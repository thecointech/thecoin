import { SetGCloudConfig, copyEnvVarsLocal } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_BROKER_CONFIG"));
  console.log(await copyEnvVarsLocal("app.secrets.yaml"));
})();

