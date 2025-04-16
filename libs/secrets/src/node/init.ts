

import { initClient, ServiceAccountName } from "./google/client";

export function init(service: ServiceAccountName, project?: string) {
  // Init our secrets for the service
  initClient(service, project);
}