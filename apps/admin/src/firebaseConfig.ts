import type { BrowserInit } from "@thecointech/firestore";
import { getSecret } from "@thecointech/secrets";

export async function getFirebaseConfig(): Promise<BrowserInit> {
  // if (process.env.NODE_ENV !== 'production') {
  //   // In development just return an empty object
  //   return {} as BrowserInit;
  // }
  const raw = await getSecret("FirebaseConfig");
  const parsed = JSON.parse(raw);
  const { ApiKey, AuthDomain, ProjectId } = parsed;
  if (!ApiKey || !AuthDomain || !ProjectId) {
    throw new Error("Invalid FirebaseConfig");
  }
  return {
    apiKey: ApiKey,
    authDomain: AuthDomain,
    projectId: ProjectId
  }
}
