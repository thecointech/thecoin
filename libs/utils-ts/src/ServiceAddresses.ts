import { log } from "@the-coin/logging";

export enum Service {

  SITE_LANDING=3000,
  SITE_APP=3001,

	RATES = 7001,
	BROKER,

  FIRESTORE = 8377,
  CERAMIC = 7007,
  ETHEREUM = 9545,
}

//
// Added to have an explicit translation from
// service name to the port it runs on in dev:live
export function DevLivePort(service: Service) {
  if (process.env.NODE_ENV === 'production') {
    log.error({service}, "Querying dev:live port in production mode");
  }
  return service;
}

//
// The URL of the service.  May return undefined to
// indicate the default service should be connected to
export function ServiceAddress(service: Service) {
  // TODO: production can be either staging or production
  if (process.env.NODE_ENV === 'production')
    return undefined;
  // In debug, we connect locally only
  return 'http://localhost:' + DevLivePort(service);
}
