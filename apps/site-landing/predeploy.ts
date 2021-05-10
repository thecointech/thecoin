import { SetGCloudConfig, FirebaseUseEnv } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_LANDING_CONFIG"));
  console.log(await FirebaseUseEnv());
})();

