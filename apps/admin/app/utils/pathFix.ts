import path from 'path';

export function pathFix() {

	const oldJoin = path.join;
	path.join = (...paths: string[]) => {
		console.log(JSON.stringify(paths));
		const pindex = paths.findIndex(p => p === "protos")
		console.log(`Pindex: ${pindex}`);
		//const packageName = paths.find(e => e.indexOf("firestore") >= 0
		const r = (pindex >= 0) ? 
			oldJoin("C:\\src\\TheCoin\\broker-cad\\manager-ts\\app\\dist", ...paths.slice(pindex)) : 
			oldJoin(...paths);

		console.log(`r: ${r}`);
		return r
	}
}