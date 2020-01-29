import ServerStatus from '../exchange/status.json';
import { BrokerStatus } from '@the-coin/types';
/**
 * Gets the operating status of the broker
 * Returns info like brokers address, available balance, etc (?)
 *
 * returns BrokerStatus
 **/
export async function status() : Promise<BrokerStatus> {
  return ServerStatus;
}

