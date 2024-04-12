import { createAction } from '@thecointech/broker-db';
import { getRemovePluginSigner, getAssignPluginSigner } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import type { AssignPluginRequest, RemovePluginRequest } from '@thecointech/types';

export async function assignPlugin(request: AssignPluginRequest) {
  log.info({user: request.user, plugin: request.plugin }, 'Request from {user} to add plugin {plugin}');

  const signer = getAssignPluginSigner(request);
  if (signer != request.user) {
    log.error({user: request.user, signer }, 'Bad request from {user}: signer does not match {signer}');
    return false;
  }

  await createAction(signer, "Plugin", {
    initial: request,
    date: DateTime.now(),
    initialId: request.signature
  })

  // There is nothing we can do to process this action, so just... ca fait tout?
  return true;
}

export async function removePlugin(request: RemovePluginRequest) {
  log.info({user: request.user, plugin: request.index }, 'Request from {user} to remove plugin {plugin}');

  const signer = getRemovePluginSigner(request);
  if (signer != request.user) {
    log.error({user: request.user, signer }, 'Bad request from {user}: signer does not match {signer}');
    return false;
  }

  await createAction(signer, "Plugin", {
    initial: request,
    date: DateTime.now(),
    initialId: request.signature
  })
  return true;
}
