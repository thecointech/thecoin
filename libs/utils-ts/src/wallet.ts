export interface DecryptWalletOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  onProgress?: (progress: number) => void;
}

type ProgressMessage = {
  type: 'progress';
  progress: number;
}

type MnemonicResult = {
  type: 'mnemonic';
  phrase: string;
  path: string | null;
}

type PrivateKeyResult = {
  type: 'privateKey';
  privateKey: string;
}

type ErrorMessage = {
  type: 'error';
  error: string;
}

export type WalletMessage = ProgressMessage | MnemonicResult | PrivateKeyResult | ErrorMessage;
