// Not used, but required to import rbcapi
export function BaseStore(_name: string) {
  return class BaseStore {
    static initialize() {};
    static release() {};
  }
}

export class ConfigStore {


  static set(_key: string, _value: string) {}

  static async get(key: string) : Promise<string|undefined> {
    // auth expects a JSON structure here
    return `{ "${key}": "value" }`;
  }
}
