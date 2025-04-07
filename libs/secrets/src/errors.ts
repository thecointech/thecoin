import type { ConfigType, SecretKeyType } from './types'

export class SecretNotFoundError extends Error {
  constructor(name: SecretKeyType) {
    super(`Secret ${name} not found`);
  }
}

export class SecretClientEnvNotFound extends Error {
  constructor() {
    super("Missing THECOIN_SECRETS environment variable");
  }
}

export class SecretClientKeyNotFound extends Error {
  constructor(config: ConfigType) {
    super(`Secret client key not found for config ${config}`);
  }
}

export class SecretGSMNotFound extends Error {
  constructor() {
    super("Missing service account for GSM client");
  }
}
