import {PLUGINMGR_ROLE } from "../src/constants";
import { getSigner } from '@thecointech/signers';
import { ContractCore } from '../src';
import { getOverrideFees } from '@thecointech/contract-base';

async function setPluginMgr() {
  const broker = await getSigner("BrokerCAD");
  const brokerAddress = await broker.getAddress();
  const tcCore = await ContractCore.connect("TheCoin");

  const overrides = await getOverrideFees(tcCore.runner.provider);
  const r = await tcCore.grantRole(PLUGINMGR_ROLE, brokerAddress, overrides);
  console.log("Set Plugin Manager to Broker: ", r.hash);
}

setPluginMgr();
