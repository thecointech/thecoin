import { SetGCloudConfig, copyEnvVarsLocal, copyNpmTokenHere, gCloudDeploy, removeOldAppVersions } from "../../tools/predeploy";

await SetGCloudConfig("GCLOUD_BROKER_CONFIG");
await copyEnvVarsLocal("app.secrets.yaml", { RUNTIME_ENV: "gcloud" });
await copyNpmTokenHere(new URL(import.meta.url));
await gCloudDeploy();
// Clean-up after
await removeOldAppVersions();
