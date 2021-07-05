import { Wallet } from 'ethers';

const _cache = new Map<string, Wallet>();

export const getSigner = (name: string) => {
  const cached = _cache.get(name);
  if (cached) return cached;

  return _cache
    .set(name, Wallet.createRandom())
    .get(name);
}
