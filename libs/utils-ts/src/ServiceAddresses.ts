import { IsDebug } from "./IsDebug";

enum ServicePorts {
	THE_CORE = 7001,
	BROKER_PORT,

  FIRESTORE_EMULATOR = 8377,
  CERAMIC_DAEMON = 7007,
  ETHEREUM_EMULATOR = 9545,
}

function ServiceAddress(port: ServicePorts) {
	return (IsDebug) ?
		'http://localhost:' + port :
		undefined;
}

export {ServiceAddress, ServicePorts}
