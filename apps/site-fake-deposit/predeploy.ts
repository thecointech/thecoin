import { SetGCloudConfig, FirebaseUseEnv } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_FAKE_DEPOSIT_SITE_CONFIG"));
  console.log(await FirebaseUseEnv());
})();

