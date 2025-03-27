import { getAuthClient } from '../src/auth';
import { getNewTokens } from '../src/token';

// validate the back-and-forth flow for
// updating tokens in Docker via bitwarden
process.env.CONFIG_NAME="prodtest";
process.env.THECOIN_CONSOLE_ONLY = "true";

const auth = await getAuthClient();
const tokens = await getNewTokens(auth);
console.log(tokens);