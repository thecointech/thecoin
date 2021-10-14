import { SetGCloudConfig, FirebaseDeploy } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_NFT_SITE_CONFIG");
  await FirebaseDeploy("GCLOUD_NFT_SITE_CONFIG");
})();

