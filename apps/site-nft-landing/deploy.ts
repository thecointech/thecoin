import { SetGCloudConfig, FirebaseUseEnv, ShellCmd } from "../../tools/predeploy";

(async () => {
  await SetGCloudConfig("GCLOUD_NFT_SITE_CONFIG");
  await FirebaseUseEnv();

  await ShellCmd("firebase deploy --only hosting")
})();

