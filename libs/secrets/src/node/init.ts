

import { initClient, ServiceAccountName } from "./google/client";

export function init(service: ServiceAccountName) {
  // Init our secrets for the service
  initClient(service);
}