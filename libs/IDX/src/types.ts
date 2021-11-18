
import type config from "./config.prod.json";

export type ConfigType = typeof config;
export type IdxAlias = keyof ConfigType["definitions"];
