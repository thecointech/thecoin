import { SetGCloudConfig, FirebaseUseEnv } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_APP_CONFIG"));
  console.log(await FirebaseUseEnv());
})();

