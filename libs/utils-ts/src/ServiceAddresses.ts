import { IsDebug } from "./IsDebug";

enum ServicePorts {
	THE_CORE = 7001,
	BROKER_PORT
}

function ServiceAddress(port: ServicePorts) {
	return (IsDebug) ?
		'http://localhost:' + port :
		undefined;
}

export {ServiceAddress, ServicePorts}
