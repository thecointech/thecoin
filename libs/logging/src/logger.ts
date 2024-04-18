import type { createLogger as createNodeLogger } from "bunyan";
import type { createLogger as createBrowserLogger } from "browser-bunyan";

// Our unified logger type.  Is the minimal of set of functionality offered
export type BunyanLogger = ReturnType<typeof createNodeLogger> | ReturnType<typeof createBrowserLogger>;
