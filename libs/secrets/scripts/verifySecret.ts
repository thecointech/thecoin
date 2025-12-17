import { getSecret } from "../src/node/getSecrets";

const s = await getSecret("BlockpassApiKey", "prodtest");
console.log(s)