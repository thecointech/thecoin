enum ServicePorts {
	THE_CORE = 7001,
	BROKER_PORT
} 

function ServiceAddress(port: ServicePorts) {
	return (process.env.NODE_ENV !== 'production') ?
		'http://localhost:' + port :
		undefined;
}

export {ServiceAddress, ServicePorts}