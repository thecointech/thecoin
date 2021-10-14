import { SetGCloudConfig, FirebaseDeploy } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_LANDING_CONFIG");
  await FirebaseDeploy("GCLOUD_LANDING_CONFIG");
})();

