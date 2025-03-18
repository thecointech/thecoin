import type { ConfigType, SecretKeyType } from './types'

export class SecretNotFoundError extends Error {
  constructor(name: SecretKeyType) {
    super(`Secret ${name} not found`);
  }
}

export class SecretClientEnvNotFound extends Error {
  constructor() {
    super("Missing THECOIN_ENVIRONMENTS environment variable");
  }
}

export class SecretClientKeyNotFound extends Error {
  constructor(config: ConfigType) {
    super(`Secret client key not found for config ${config}`);
  }
}