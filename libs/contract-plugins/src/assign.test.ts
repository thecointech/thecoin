// import { jest } from '@jest/globals';
// import hre from 'hardhat';
// import '@nomiclabs/hardhat-ethers';
// import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
// import { ALL_PERMISSIONS } from './constants';
// import { assignPlugin, buildAssignPluginRequest } from './assign';

// jest.setTimeout(5 * 60 * 1000);
it ('can assign plugin', async () => {
  // const signers = initAccounts(await hre.ethers.getSigners());
  // const tcCore = await createAndInitTheCoin(signers.Owner);

  // const request = await buildAssignPluginRequest(signers.client1, tcCore.address, ALL_PERMISSIONS);
  // // const r1 = await tcCore.getAssignHash(
  // //   request.user,
  // //   request.chainId,
  // //   request.plugin,
  // //   request.timeMs.toMillis(),
  // //   request.permissions,
  // //   request.signedAt.toMillis(),
  // //   request.signature
  // // );
  // // const r = await tcCore.getAssignSigner(
  // //   request.user,
  // //   request.chainId,
  // //   request.plugin,
  // //   request.timeMs.toMillis(),
  // //   request.permissions,
  // //   request.signedAt.toMillis(),
  // //   request.signature
  // // );
  // // console.log(r);

  // // const request2 = await buildAssignPluginRequest(signers.client1, tcCore.address, ALL_PERMISSIONS);

  // const tx = await assignPlugin(tcCore, request);
  // expect(tx.hash).toBeDefined();
})
