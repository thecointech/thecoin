import { Controller, Body, Route, Post, Response, Tags, Delete } from '@tsoa/runtime';
// import type { AssignPluginRequest, RemovePluginRequest } from '@thecointech/types';
import type { ServerError, ValidateErrorJSON } from '../types';
import { assignPlugin, removePlugin } from '../plugins';
import { DateTime } from 'luxon';

// Duplicated types to ease handling of DateTime
type APR = {
  chainId: number;
  user: string;
  plugin: string;
  timeMs: number;
  permissions: string;
  signedAt: number;
  signature: string;
}
type RPR = {
  user: string;
  chainId: number;
  index: number;
  signedAt: number;
  signature: string;
}

@Route('plugins')
@Tags('Plugins')
export class PluginsController extends Controller {

    /**
     * Requests a plugin assignment
     * Does no actual assignments, only adds the request to the DB
     **/
    @Post("plugin")
    @Response('200', 'The assign request has been added to the queue')
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @Response<ServerError>(500, "Server Error")
    assignPlugin(@Body() request: APR) : Promise<boolean> {
      return assignPlugin({
        ...request,
        timeMs: DateTime.fromMillis(request.timeMs),
        signedAt: DateTime.fromMillis(request.signedAt),
      });
    }

    @Delete("plugin")
    @Response('200', 'The response confirms to the user the order has been processed')
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @Response<ServerError>(500, "Server Error")
    removePlugin(@Body() request: RPR) : Promise<boolean> {
      return removePlugin({
        ...request,
        signedAt: DateTime.fromMillis(request.signedAt),
      });
    }
}
