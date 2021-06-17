import { SetGCloudConfig, copyEnvVarsLocal, copyNpmTokenHere } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_RATES_CONFIG"));
  console.log(await copyEnvVarsLocal("app.secrets.yaml"));
  console.log(await copyNpmTokenHere(__dirname));
})();

