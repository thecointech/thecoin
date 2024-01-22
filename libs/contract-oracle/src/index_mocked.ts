import { BigNumber, ContractTransaction } from 'ethers';
import { DateTime } from 'luxon';
import { SpxCadOracle as Src } from './codegen/contracts/SpxCadOracle';
import { last } from '@thecointech/utilities';
export * from './update';

export class SpxCadOracle implements Pick<Src, 'INITIAL_TIMESTAMP' | 'BLOCK_TIME' | 'initialize' | 'update' | 'bulkUpdate' | 'updateOffset' | 'getOffset' | 'lastOffsetFrom' | 'getBlockIndexFor' | 'getRoundFromTimestamp' | 'decimals'> {

  // By default, we cover the last year
  initialTimestamp = DateTime
    .now()
    .minus({ years: 1 })
    .set({ hour: 9, minute: 31, second: 30, millisecond: 0 })
    .toMillis();
  // In most code, we run on 3hrs, but in here lets up that to 24 hrs.
  blockTime = 24 * 60 * 60 * 1000;
  offsets: { from: number, offset: number}[] = [];
  rates: number[] = [];

  async initialize(_updater: string, initialTimestamp: number, blockTime: number) {
    this.initialTimestamp = initialTimestamp;
    this.blockTime = blockTime;
    this.rates = [];
    return { } as any;
  }
  INITIAL_TIMESTAMP = () => Promise.resolve(BigNumber.from(this.initialTimestamp));
  BLOCK_TIME = () => Promise.resolve(BigNumber.from(this.blockTime));
  validUntil = () => Promise.resolve(BigNumber.from((last(this.offsets)?.offset ?? 0) + this.initialTimestamp + (this.rates.length * this.blockTime)));

  async bulkUpdate(rates: number[]) {
    this.rates.push(...rates);
    return {} as any;
  }
  update(newValue: number): Promise<ContractTransaction> {
    this.rates.push(newValue);
    return {} as any;
  }
  updateOffset(offset: { from: number, offset: number}): Promise<ContractTransaction> {
    this.offsets.push(offset);
    return {} as any;
  }

  async getOffset(timestamp: number): Promise<BigNumber> {
    // Search backwards for the correct offset
    // This assumes most queries will be for current time
    for (let i = this.offsets.length - 1; i >= 0; i--) {
      if (this.offsets[i].from < timestamp) {
        return Promise.resolve(BigNumber.from(this.offsets[i].offset));
      }
    }
    return Promise.resolve(BigNumber.from(0));;
  }

  async lastOffsetFrom() {
    return Promise.resolve(BigNumber.from(
      this.offsets.length == 0
        ? 0
        : this.offsets[this.offsets.length - 1].from)
    );
  }

  async getBlockIndexFor(timestamp: number): Promise<BigNumber> {
    const offset = await this.getOffset(timestamp);
    const blockIdx = (timestamp - this.initialTimestamp - offset.toNumber()) / this.blockTime;
    return Promise.resolve(BigNumber.from(Math.floor(blockIdx)));
  }

  async getRoundFromTimestamp(timestamp: number): Promise<BigNumber> {
    const blockIdx = await this.getBlockIndexFor(timestamp);
    return Promise.resolve(BigNumber.from(this.rates[blockIdx.toNumber()]));
  }

  async decimals() { return Promise.resolve(8); }
}

export const getContract = () => new SpxCadOracle() as unknown as Src;
export const connectOracle = getContract;
