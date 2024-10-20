import { Signer } from 'ethers';
import { DateTime } from 'luxon';
import { solidityPackedKeccak256, verifyMessage, getBytes } from 'ethers';
import { sign } from "@thecointech/utilities/SignedMessages";
import type { IPluggable } from './codegen/contracts';
import type { RemovePluginRequest } from '@thecointech/types';
// export type RemovePluginRequest = {
//   user: string;
//   chainId: number;
//   index: number;
//   signedAt: DateTime;
//   signature: string;
// }

function getRemovePluginBuffer(request: Omit<RemovePluginRequest, 'signature'>) {
  const hash = solidityPackedKeccak256(
    ["uint", "uint", "uint"],
    [
      request.chainId,
      request.index,
      request.signedAt.toMillis()
    ]
  );
  return getBytes(hash);
}

export async function buildRemovePluginRequest(
  user: Signer,
  index: number)
: Promise<RemovePluginRequest>
{
  const chainId = parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID ?? "-1");
  const signedAt = DateTime.now();
  const address = await user.getAddress();
  var r = {
    user: address,
    chainId,
    index,
    signedAt,
  };
  const hash = getRemovePluginBuffer(r);
  const signature = await sign(hash, user);

  return {
    ...r,
    signature,
  };
}

export async function removePlugin(contract: IPluggable, request: RemovePluginRequest) {
  const tx = await contract.pl_removePlugin({
    ...request,
    msSignedAt: request.signedAt.toMillis(),
  });
  return tx;
}

export function getRemovePluginSigner(request: RemovePluginRequest) {

  const hash = getRemovePluginBuffer(request);
  return verifyMessage(hash, request.signature);
}
