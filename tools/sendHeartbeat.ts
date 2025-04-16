import { GetHarvesterApi } from '@thecointech/apis/broker';
import { getSigner } from "@thecointech/signers";

try {
  const r = await GetHarvesterApi().heartbeat({
    timeMs: 0,
    result: "success",
    signature: "asdfasdf",
  });

  console.log(r.statusText);
}
catch(e) {
  console.log(e.message);
}

const mockPayee = {
  payee: "mocked visa card",
  accountNumber: "1234567890",
}

import { BuildUberAction } from '@thecointech/utilities/UberAction';
import Decimal from 'decimal.js-light';
import { DateTime } from "luxon";
import { GetPluginsApi, GetBillPaymentsApi } from '@thecointech/apis/broker';
import { ALL_PERMISSIONS, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';

const brokerAddress = process.env.WALLET_BrokerCAD_ADDRESS!;
const signer = await getSigner('Client1');
const billPayment = await BuildUberAction(
  mockPayee,
  signer,
  brokerAddress,
  new Decimal(100),
  124,
  DateTime.now()
)
const r = await GetBillPaymentsApi().uberBillPayment(billPayment);
// This should be initial
console.log("Expected Initial, got: ", r.data.state);

// const converter = await getUberContract();
// const request = await buildAssignPluginRequest(
//   signer,
//   converter,
//   ALL_PERMISSIONS,
// );
// const r = await GetPluginsApi().assignPlugin({
//   ...request,
//   timeMs: request.timeMs.toMillis(),
//   signedAt: request.signedAt.toMillis(),
// });
// console.log(r.data)
