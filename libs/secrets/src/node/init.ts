

import { initClient, ServiceAccountName } from "./google/client";

export function init(service: ServiceAccountName, projectId: string) {
  // Init our secrets for the service
  initClient(service, projectId);
}