import { SetGCloudConfig, copyEnvVarsLocal, copyNpmTokenHere, gCloudDeploy, removeOldAppVersions } from "../../tools/predeploy";
import { SecretKeyType } from "@thecointech/secrets";

await SetGCloudConfig("GCLOUD_BROKER_CONFIG");
await copyEnvVarsLocal(
  "app.secrets.yaml",
  { RUNTIME_ENV: "gcloud" },
  [
    // Required for storing ID
    "BlockpassApiKey",
    "BlockpassWebhookSecret",
    "GCloudImageStorageBucket",
    // required for emailing-on-error
    "MailjetApiKey",
    "MailjetApiSecret",
    // Required for talking to blockchain
    "InfuraProjectId"
  ]
);
await copyNpmTokenHere(new URL(import.meta.url));
await gCloudDeploy();
// Clean-up after
await removeOldAppVersions();
