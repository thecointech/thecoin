/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NewsletterController } from './../controllers/Rates.controller';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
  "SubscriptionDetails": {
    "dataType": "refObject",
    "properties": {
      "id": { "dataType": "string" },
      "email": { "dataType": "string" },
      "confirmed": { "dataType": "boolean" },
      "firstName": { "dataType": "string" },
      "lastName": { "dataType": "string" },
      "country": { "dataType": "string" },
      "city": { "dataType": "string" },
    },
    "additionalProperties": false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "BoolResponse": {
    "dataType": "refObject",
    "properties": {
      "success": { "dataType": "boolean" },
    },
    "additionalProperties": false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Express) {
  // ###########################################################################################################
  //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
  //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
  // ###########################################################################################################
  app.get('/api/v1/newsletter/details',
    function(request: any, response: any, next: any) {
      const args = {
        id: { "in": "query", "name": "id", "required": true, "dataType": "string" },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new NewsletterController();


      const promise = controller.newsletterDetails.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get('/api/v1/newsletter/unsubscribe',
    function(request: any, response: any, next: any) {
      const args = {
        id: { "in": "query", "name": "id", "required": true, "dataType": "string" },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new NewsletterController();


      const promise = controller.newsletterUnsubscribe.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put('/api/v1/newsletter/confirm',
    function(request: any, response: any, next: any) {
      const args = {
        details: { "in": "body", "name": "details", "required": true, "ref": "SubscriptionDetails" },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new NewsletterController();


      const promise = controller.newsletterConfirm.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post('/api/v1/newsletter/signup',
    function(request: any, response: any, next: any) {
      const args = {
        details: { "in": "body", "name": "details", "required": true, "ref": "SubscriptionDetails" },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new NewsletterController();


      const promise = controller.newsletterSignup.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function isController(object: any): object is Controller {
    return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
  }

  function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
    return Promise.resolve(promise)
      .then((data: any) => {
        let statusCode;
        if (isController(controllerObj)) {
          const headers = controllerObj.getHeaders();
          Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
          });

          statusCode = controllerObj.getStatus();
        }

        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
          data.pipe(response);
        } else if (data || data === false) { // === false allows boolean result
          response.status(statusCode || 200).json(data);
        } else {
          response.status(statusCode || 204).end();
        }
      })
      .catch((error: any) => next(error));
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function getValidatedArgs(args: any, request: any): any[] {
    const fieldErrors: FieldErrors = {};
    const values = Object.keys(args).map((key) => {
      const name = args[key].name;
      switch (args[key].in) {
        case 'request':
          return request;
        case 'query':
          return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, { "noImplicitAdditionalProperties": "silently-remove-extras", "controllerPathGlobs": ["./src/controllers/**/*controller.ts"], "specVersion": 2 });
        case 'path':
          return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, { "noImplicitAdditionalProperties": "silently-remove-extras", "controllerPathGlobs": ["./src/controllers/**/*controller.ts"], "specVersion": 2 });
        case 'header':
          return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, { "noImplicitAdditionalProperties": "silently-remove-extras", "controllerPathGlobs": ["./src/controllers/**/*controller.ts"], "specVersion": 2 });
        case 'body':
          return validationService.ValidateParam(args[key], request.body, name, fieldErrors, name + '.', { "noImplicitAdditionalProperties": "silently-remove-extras", "controllerPathGlobs": ["./src/controllers/**/*controller.ts"], "specVersion": 2 });
        case 'body-prop':
          return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', { "noImplicitAdditionalProperties": "silently-remove-extras", "controllerPathGlobs": ["./src/controllers/**/*controller.ts"], "specVersion": 2 });
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidateError(fieldErrors, '');
    }
    return values;
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
