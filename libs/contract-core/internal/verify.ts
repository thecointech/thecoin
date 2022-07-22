//@ts-ignore
import type DeployInfo from '../.openzeppelin/unknown-80001.json' assert {type: "json"};
import { verify } from "@thecointech/contract-tools/verify";

async function verifyL2() {
  const deployments = require('../.openzeppelin/unknown-80001.json') as typeof DeployInfo;

  const latestImpl = Object.values(deployments.impls).pop()!;
  verify("polygon", "TheCoinL2", latestImpl.address)
}

verifyL2();
