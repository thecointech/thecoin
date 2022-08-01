
import type config from "./config.prodtest.json";
import type { SelfID as SelfIDGeneric } from '@self.id/web';

export type ConfigType = typeof config;
export type IdxAlias = keyof ConfigType["definitions"];
export type SelfID = SelfIDGeneric<ConfigType>;
