import type { createLogger } from "browser-bunyan";

// Our unified logger type.  Is the minimal of set of functionality offered
export type BunyanLogger = Omit<ReturnType<typeof createLogger>, "addStream"|"addSerializers"|"child">;
