import { connect } from '@thecointech/contract-base/connect';
import {PLUGINMGR_ROLE } from "../src/constants";
import { getSigner } from '@thecointech/signers';
import { GetContract } from '../src';
import { getOverrideFees } from '@thecointech/contract-base';

async function setPluginMgr() {
  const contract = await GetContract();
  const theCoin = await getSigner("TheCoin");
  const broker = await getSigner("BrokerCAD");
  const brokerAddress = await broker.getAddress();
  const tcCore = connect(theCoin, contract);

  const overrides = await getOverrideFees(contract.runner.provider);
  const r = await tcCore.grantRole(PLUGINMGR_ROLE, brokerAddress, overrides);
  console.log("Set Plugin Manager to Broker: ", r.hash);
}

setPluginMgr();
