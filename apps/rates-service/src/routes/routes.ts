/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RatesController } from './../controllers/rates.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UpdateController } from './../controllers/update.controller';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "CurrencyCode": {
        "dataType": "refEnum",
        "enums": [784,971,8,51,532,973,32,36,533,944,977,52,50,975,48,108,60,96,68,984,986,44,64,72,933,84,124,976,947,756,948,990,152,156,170,970,188,931,192,132,203,262,208,214,12,818,232,230,978,242,238,826,981,936,292,270,324,320,328,344,340,191,332,348,360,376,356,368,364,352,388,400,392,404,417,116,174,408,410,414,136,398,418,422,144,430,426,434,504,498,969,807,104,496,446,929,480,462,454,484,979,458,943,516,566,558,578,524,554,512,590,604,598,608,586,985,600,634,946,941,643,646,682,90,690,938,752,702,654,694,706,968,728,930,222,760,748,764,972,934,788,776,949,780,901,834,980,800,840,997,940,858,927,860,928,704,548,882,950,961,959,955,956,957,958,951,960,952,964,953,962,994,963,965,999,886,710,967,932],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FXRate": {
        "dataType": "refObject",
        "properties": {
            "8": {"dataType":"double"},
            "12": {"dataType":"double"},
            "32": {"dataType":"double"},
            "36": {"dataType":"double"},
            "44": {"dataType":"double"},
            "48": {"dataType":"double"},
            "50": {"dataType":"double"},
            "51": {"dataType":"double"},
            "52": {"dataType":"double"},
            "60": {"dataType":"double"},
            "64": {"dataType":"double"},
            "68": {"dataType":"double"},
            "72": {"dataType":"double"},
            "84": {"dataType":"double"},
            "90": {"dataType":"double"},
            "96": {"dataType":"double"},
            "104": {"dataType":"double"},
            "108": {"dataType":"double"},
            "116": {"dataType":"double"},
            "124": {"dataType":"double"},
            "132": {"dataType":"double"},
            "136": {"dataType":"double"},
            "144": {"dataType":"double"},
            "152": {"dataType":"double"},
            "156": {"dataType":"double"},
            "170": {"dataType":"double"},
            "174": {"dataType":"double"},
            "188": {"dataType":"double"},
            "191": {"dataType":"double"},
            "192": {"dataType":"double"},
            "203": {"dataType":"double"},
            "208": {"dataType":"double"},
            "214": {"dataType":"double"},
            "222": {"dataType":"double"},
            "230": {"dataType":"double"},
            "232": {"dataType":"double"},
            "238": {"dataType":"double"},
            "242": {"dataType":"double"},
            "262": {"dataType":"double"},
            "270": {"dataType":"double"},
            "292": {"dataType":"double"},
            "320": {"dataType":"double"},
            "324": {"dataType":"double"},
            "328": {"dataType":"double"},
            "332": {"dataType":"double"},
            "340": {"dataType":"double"},
            "344": {"dataType":"double"},
            "348": {"dataType":"double"},
            "352": {"dataType":"double"},
            "356": {"dataType":"double"},
            "360": {"dataType":"double"},
            "364": {"dataType":"double"},
            "368": {"dataType":"double"},
            "376": {"dataType":"double"},
            "388": {"dataType":"double"},
            "392": {"dataType":"double"},
            "398": {"dataType":"double"},
            "400": {"dataType":"double"},
            "404": {"dataType":"double"},
            "408": {"dataType":"double"},
            "410": {"dataType":"double"},
            "414": {"dataType":"double"},
            "417": {"dataType":"double"},
            "418": {"dataType":"double"},
            "422": {"dataType":"double"},
            "426": {"dataType":"double"},
            "430": {"dataType":"double"},
            "434": {"dataType":"double"},
            "446": {"dataType":"double"},
            "454": {"dataType":"double"},
            "458": {"dataType":"double"},
            "462": {"dataType":"double"},
            "480": {"dataType":"double"},
            "484": {"dataType":"double"},
            "496": {"dataType":"double"},
            "498": {"dataType":"double"},
            "504": {"dataType":"double"},
            "512": {"dataType":"double"},
            "516": {"dataType":"double"},
            "524": {"dataType":"double"},
            "532": {"dataType":"double"},
            "533": {"dataType":"double"},
            "548": {"dataType":"double"},
            "554": {"dataType":"double"},
            "558": {"dataType":"double"},
            "566": {"dataType":"double"},
            "578": {"dataType":"double"},
            "586": {"dataType":"double"},
            "590": {"dataType":"double"},
            "598": {"dataType":"double"},
            "600": {"dataType":"double"},
            "604": {"dataType":"double"},
            "608": {"dataType":"double"},
            "634": {"dataType":"double"},
            "643": {"dataType":"double"},
            "646": {"dataType":"double"},
            "654": {"dataType":"double"},
            "682": {"dataType":"double"},
            "690": {"dataType":"double"},
            "694": {"dataType":"double"},
            "702": {"dataType":"double"},
            "704": {"dataType":"double"},
            "706": {"dataType":"double"},
            "710": {"dataType":"double"},
            "728": {"dataType":"double"},
            "748": {"dataType":"double"},
            "752": {"dataType":"double"},
            "756": {"dataType":"double"},
            "760": {"dataType":"double"},
            "764": {"dataType":"double"},
            "776": {"dataType":"double"},
            "780": {"dataType":"double"},
            "784": {"dataType":"double"},
            "788": {"dataType":"double"},
            "800": {"dataType":"double"},
            "807": {"dataType":"double"},
            "818": {"dataType":"double"},
            "826": {"dataType":"double"},
            "834": {"dataType":"double"},
            "840": {"dataType":"double"},
            "858": {"dataType":"double"},
            "860": {"dataType":"double"},
            "882": {"dataType":"double"},
            "886": {"dataType":"double"},
            "901": {"dataType":"double"},
            "927": {"dataType":"double"},
            "928": {"dataType":"double"},
            "929": {"dataType":"double"},
            "930": {"dataType":"double"},
            "931": {"dataType":"double"},
            "932": {"dataType":"double"},
            "933": {"dataType":"double"},
            "934": {"dataType":"double"},
            "936": {"dataType":"double"},
            "938": {"dataType":"double"},
            "940": {"dataType":"double"},
            "941": {"dataType":"double"},
            "943": {"dataType":"double"},
            "944": {"dataType":"double"},
            "946": {"dataType":"double"},
            "947": {"dataType":"double"},
            "948": {"dataType":"double"},
            "949": {"dataType":"double"},
            "950": {"dataType":"double"},
            "951": {"dataType":"double"},
            "952": {"dataType":"double"},
            "953": {"dataType":"double"},
            "955": {"dataType":"double"},
            "956": {"dataType":"double"},
            "957": {"dataType":"double"},
            "958": {"dataType":"double"},
            "959": {"dataType":"double"},
            "960": {"dataType":"double"},
            "961": {"dataType":"double"},
            "962": {"dataType":"double"},
            "963": {"dataType":"double"},
            "964": {"dataType":"double"},
            "965": {"dataType":"double"},
            "967": {"dataType":"double"},
            "968": {"dataType":"double"},
            "969": {"dataType":"double"},
            "970": {"dataType":"double"},
            "971": {"dataType":"double"},
            "972": {"dataType":"double"},
            "973": {"dataType":"double"},
            "975": {"dataType":"double"},
            "976": {"dataType":"double"},
            "977": {"dataType":"double"},
            "978": {"dataType":"double"},
            "979": {"dataType":"double"},
            "980": {"dataType":"double"},
            "981": {"dataType":"double"},
            "984": {"dataType":"double"},
            "985": {"dataType":"double"},
            "986": {"dataType":"double"},
            "990": {"dataType":"double"},
            "994": {"dataType":"double"},
            "997": {"dataType":"double"},
            "999": {"dataType":"double"},
            "validTill": {"dataType":"double","required":true},
            "validFrom": {"dataType":"double","required":true},
            "sell": {"dataType":"double","required":true},
            "buy": {"dataType":"double","required":true},
            "fxRate": {"dataType":"double","required":true},
            "target": {"ref":"CurrencyCode","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.get('/api/v1/rates/:currencyCode',
            function (request: any, response: any, next: any) {
            const args = {
                    currencyCode: {"in":"path","name":"currencyCode","required":true,"dataType":"double"},
                    timestamp: {"in":"query","name":"timestamp","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RatesController();


            const promise = controller.getSingle.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/v1/many',
            function (request: any, response: any, next: any) {
            const args = {
                    timestamps: {"in":"query","name":"timestamps","required":true,"dataType":"array","array":{"dataType":"double"}},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RatesController();


            const promise = controller.getMany.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/v1/doUpdate',
            function (request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UpdateController();


            const promise = controller.doUpdate.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus();
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }
    
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"silently-remove-extras"});
                case 'res':
                    return responder(response);
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
