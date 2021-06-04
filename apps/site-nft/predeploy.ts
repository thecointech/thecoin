import { SetGCloudConfig, FirebaseUseEnv } from "../../tools/predeploy";

(async () => {
  console.log(await SetGCloudConfig("GCLOUD_NFT_SITE_CONFIG"));
  console.log(await FirebaseUseEnv());
})();

