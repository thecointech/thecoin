import { SetGCloudConfig, copyEnvVarsLocal } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_RATES_CONFIG"));
  console.log(await copyEnvVarsLocal("app.secrets.yaml"));
})();

