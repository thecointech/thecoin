import { last } from '@thecointech/utilities';
import { DateTime } from 'luxon';
import type { AddressLike, BigNumberish } from 'ethers';
import type { SpxCadOracle as Src } from '../src/codegen/contracts/SpxCadOracle';
import type { StateMutability, TypedContractMethod } from '../src/codegen/common';
import { defineContractBaseSingleton } from '@thecointech/contract-base/singleton';

export * from '../src/update';

const makeFn = <
A extends Array<any> = Array<any>,
R = any,
S extends StateMutability = "payable"
>(r: (...a: A) => R, _s?: S) => r as any as TypedContractMethod<A, [Awaited<R>], S>;

export class SpxCadOracleMocked implements Pick<Src, 'INITIAL_TIMESTAMP' | 'BLOCK_TIME' | 'initialize' | 'update' | 'bulkUpdate' | 'updateOffset' | 'getOffset' | 'lastOffsetFrom' | 'getBlockIndexFor' | 'getRoundFromTimestamp' | 'decimals'> {

  // By default, we cover the last year
  initialTimestamp = BigInt(
    DateTime
      .now()
      .minus({ years: 1 })
      .set({ hour: 9, minute: 31, second: 30, millisecond: 0 })
      .toMillis()
  );
  // In most code, we run on 3hrs, but in here lets up that to 24 hrs.
  blockTime = BigInt(24 * 60 * 60 * 1000);
  offsets: { from: number, offset: bigint}[] = [];
  rates: bigint[] = [];

  runner = {
    provider: {
      getFeeData: () => ({
        maxFeePerGas: 10n,
        maxPriorityFeePerGas: 10n,
      }),
    }
  }

  connect = () => this;

  initialize = makeFn((_updater: AddressLike, initialTimestamp: BigNumberish, blockTime: BigNumberish) => {
    this.initialTimestamp = BigInt(initialTimestamp);
    this.blockTime = BigInt(blockTime);
    this.rates = [];
    return { } as any;
  })
  INITIAL_TIMESTAMP = makeFn(() => this.initialTimestamp, "view");
  BLOCK_TIME = makeFn(() => this.blockTime, "view");
  validUntil = makeFn(() => (last(this.offsets)?.offset ?? 0n) + this.initialTimestamp + (BigInt(this.rates.length) * this.blockTime));

  bulkUpdate = makeFn((rates: BigNumberish[]) => {
    this.rates.push(...rates.map(n => BigInt(n)));
    return {
      wait: () => Promise.resolve(),
    } as any;
  })

  update = makeFn((newValue: BigNumberish) => {
    this.rates.push(BigInt(newValue));
    return {
      wait: () => Promise.resolve(),
    } as any;
  });

  updateOffset = makeFn((offset: { from: BigNumberish, offset: BigNumberish}) => {
    this.offsets.push({
      from: Number(offset.from),
      offset: BigInt(offset.offset),
    });
    return {
      wait: () => Promise.resolve(),
    } as any;
  })

  getOffset = makeFn((timestamp: BigNumberish) => {
    // Search backwards for the correct offset
    // This assumes most queries will be for current time
    for (let i = this.offsets.length - 1; i >= 0; i--) {
      if (this.offsets[i].from <= Number(timestamp)) {
        return this.offsets[i].offset;
      }
    }
    return 0n;
  }, "view")

  lastOffsetFrom = makeFn(() => {
    return this.offsets.length == 0
        ? 0n
        : BigInt(this.offsets[this.offsets.length - 1].from)
  }, 'view')

  getBlockIndexFor = makeFn(async (timestamp: BigNumberish) => {
    const offset = await this.getOffset(timestamp);
    return (BigInt(timestamp) - this.initialTimestamp - offset) / this.blockTime;
  }, "view")

  getRoundFromTimestamp = makeFn(async (timestamp: BigNumberish) => {
    const blockIdx = await this.getBlockIndexFor(timestamp);
    return this.rates[Number(blockIdx)];
  }, "view")

  decimals = makeFn(() => 8n, "view");
}

export const ContractOracle = defineContractBaseSingleton<Src>(
  '__oracle',
  async () => new SpxCadOracleMocked() as any,
);
