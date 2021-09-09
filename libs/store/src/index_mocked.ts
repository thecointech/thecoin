export function BaseStore(_name: string) {
  return class BaseStore {
    static initialize() {};
    static release() {};
  }
}

export class ConfigStore extends BaseStore("config") {
  static set(_key: string, _value: string) {}
  static get(key: string) : Promise<string|undefined> {
    // auth expects a JSON structure here
    return Promise.resolve(`{ "${key}": "value" }`);
  }
}
