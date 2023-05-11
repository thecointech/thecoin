
import type config from "./config.prodtest.json";
export type { ComposeClient }from '@composedb/client'

export type ConfigType = typeof config;
export type IdxAlias = keyof ConfigType["definitions"];
