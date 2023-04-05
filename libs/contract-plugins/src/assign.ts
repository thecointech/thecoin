import { Signer } from '@ethersproject/abstract-signer';
import { DateTime } from 'luxon';
import { keccak256 } from '@ethersproject/solidity';
import { verifyMessage } from '@ethersproject/wallet';
import { arrayify } from '@ethersproject/bytes';
import { sign } from "@thecointech/utilities/SignedMessages";
import type { IPluggable } from './types/contracts';
import type { AssignPluginRequest } from '@thecointech/types';

// export type AssignPluginRequest = {
//   chainId: number;
//   user: string;
//   plugin: string;
//   permissions: string;
//   signedAt: DateTime;
//   signature: string;
// }

function getAssignPluginBuffer(request: Omit<AssignPluginRequest, 'signature'>) {
  // The concatenation for the signature is id, lastUpdate, prefix, hash
  const hash = keccak256(
    ["uint", "address", "uint", "uint96", "uint"],
    [
      request.chainId,
      request.plugin,
      request.timeMs.toMillis(),
      request.permissions,
      request.signedAt.toMillis()
    ]
  );
  return arrayify(hash);
}

// Our official implementation does not allow for arbitrary timeMs parameter (we only use signedAt)
export async function buildAssignPluginRequest(
  user: Signer,
  plugin: string,
  permissions: string,
  timeMs?: DateTime)
: Promise<AssignPluginRequest>
{
  const chainId = parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID ?? "-1");
  const signedAt = DateTime.now();
  const address = await user.getAddress();
  var r = {
    chainId,
    user: address,
    plugin,
    permissions,
    signedAt,
    timeMs: timeMs ?? signedAt,
  };
  const hash = getAssignPluginBuffer(r);
  const signature = await sign(hash, user);

  return {
    ...r,
    signature,
  };
}

export async function assignPlugin(contract: IPluggable, request: AssignPluginRequest) {
  const tx = await contract.pl_assignPlugin(
    request.user,
    request.chainId,
    request.plugin,
    request.signedAt.toMillis(),
    request.permissions,
    request.signedAt.toMillis(),
    request.signature
  );
  return tx;
}

export function getAssignPluginSigner(request: AssignPluginRequest) {

  const hash = getAssignPluginBuffer(request);
  return verifyMessage(hash, request.signature);
}
