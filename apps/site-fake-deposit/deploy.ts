import { SetGCloudConfig, FirebaseDeploy } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_FAKE_DEPOSIT_SITE_CONFIG");
  await FirebaseDeploy("GCLOUD_FAKE_DEPOSIT_SITE_CONFIG");
})();

