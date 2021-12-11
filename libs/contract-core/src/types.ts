import type { TheCoin as TheCoinBase} from './types/TheCoin';
import type { Erc20Provider } from '@thecointech/ethers-provider';;

// Replace the default type for the provider, as this is always present
export type TheCoin = TheCoinBase & { provider: Erc20Provider }
