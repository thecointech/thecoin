import { SetGCloudConfig, FirebaseDeploy } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_APP_CONFIG");
  await FirebaseDeploy("GCLOUD_APP_CONFIG");
})();

