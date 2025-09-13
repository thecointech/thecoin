import { EncryptedDatabase } from "../store/encrypted";
import { transformIn } from "./transform";
import { ConfigShape } from "./types";

export class ConfigDatabase extends EncryptedDatabase<ConfigShape, ConfigShape, Partial<ConfigShape>> {
  constructor(rootFolder: string) {
    super({
      rootFolder,
      dbname: 'config',
      key: "config",
      password: "hF,835-/=Pw\\nr6r",
      transformIn,
      transformOut: (data) => data,
    });
  }

  // async get() {
  //   const stored = await this.get();
  //   return stored as any;
  // }
  // async set(data: Partial<ConfigShape>) {
  //   const stored = transformIn(data);
  //   return await this._set(stored);
  // }
}
