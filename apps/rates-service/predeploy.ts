import { copyEnvVarsLocal, copyNpmTokenHere } from "../../tools/predeploy";

export async function predeploy() {
  await copyEnvVarsLocal(
    "app.secrets.yaml",
    { RUNTIME_ENV: "gcloud" },
    []
  );
  await copyNpmTokenHere(new URL(import.meta.url));
};

if (import.meta.url === `file://${process.argv[1]}`) {
  // Code to run when file is executed directly
  await predeploy();
}
