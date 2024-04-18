import { connect } from '@thecointech/contract-base/connect';
import {PLUGINMGR_ROLE } from "../src/constants";
import { getSigner } from '@thecointech/signers';
import { GetContract } from '../src';
import { BigNumber } from 'ethers';

const MinimumBloodsuckerFee = 30 * Math.pow(10, 9);

async function setPluginMgr() {
  const contract = await GetContract();
  const theCoin = await getSigner("TheCoin");
  const broker = await getSigner("BrokerCAD");
  const brokerAddress = await broker.getAddress();
  const tcCore = connect(theCoin, contract);

  const fees = await contract.provider.getFeeData();
  const base = fees.maxFeePerGas.sub(fees.maxPriorityFeePerGas);
  const newMinimumTip = MinimumBloodsuckerFee;
  const tip = Math.max(fees.maxPriorityFeePerGas.toNumber(), newMinimumTip);
  const overrides = {
    maxFeePerGas: base.mul(2).add(tip),
    maxPriorityFeePerGas: BigNumber.from(tip),
  }

  const r = await tcCore.grantRole(PLUGINMGR_ROLE, brokerAddress, overrides);
  console.log("Set Plugin Manager to Broker: ", r.hash);
}

setPluginMgr();
