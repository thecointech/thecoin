import { Signer } from '@ethersproject/abstract-signer';
import { DateTime } from 'luxon';
import { keccak256 } from '@ethersproject/solidity';
import { verifyMessage } from '@ethersproject/wallet';
import { arrayify } from '@ethersproject/bytes';
import { sign } from "@thecointech/utilities/SignedMessages";
import type { IPluggable } from './types/contracts';
import type { RemovePluginRequest } from '@thecointech/types';
// export type RemovePluginRequest = {
//   user: string;
//   chainId: number;
//   index: number;
//   signedAt: DateTime;
//   signature: string;
// }

function getRemovePluginBuffer(request: Omit<RemovePluginRequest, 'signature'>) {
  const hash = keccak256(
    ["uint", "uint", "uint"],
    [
      request.chainId,
      request.index,
      request.signedAt.toMillis()
    ]
  );
  return arrayify(hash);
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
  const tx = await contract.pl_removePlugin(
    request.user,
    request.chainId,
    request.index,
    request.signedAt.toMillis(),
    request.signature
  );
  return tx;
}

export function getRemovePluginSigner(request: RemovePluginRequest) {

  const hash = getRemovePluginBuffer(request);
  return verifyMessage(hash, request.signature);
}
