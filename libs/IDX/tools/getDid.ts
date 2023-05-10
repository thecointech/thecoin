import { getAdminDID } from '../internal/admin';

const did = await getAdminDID();

console.log(did.id);
