import { BaseStore } from './base';

type DocType = {
    value: string
}
export class ConfigStore extends BaseStore<DocType>("config_data") {

  static set(key: string, value: string) {
    return ConfigStore.db.upsert(key, (doc) => ({
      ...doc,
      value
    }));
  }

  static async get(key: string) : Promise<string|undefined> {
    try {
      const {value} = await ConfigStore.db.get(key);
      return value;
    }
    catch (e) {
      if (e.status == 404)
        return undefined;
      throw e;
    }
  }
}
