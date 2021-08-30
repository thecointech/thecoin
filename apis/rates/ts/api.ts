// tslint:disable
/**
 * TheCoin Core
 * TheCoin pricing service.  Published by TheCoin Tech
 *
 * The version of the OpenAPI document: 0.1.0
 * Contact: stephen.taylor.dev@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as globalImportUrl from 'url';
import { Configuration } from './configuration';
import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from './base';

/**
 * 
 * @export
 * @interface FXRate
 */
export interface FXRate {
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    target?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    buy: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    sell: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    fxRate: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    validFrom: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    validTill: number;
}

/**
 * RatesApi - axios parameter creator
 * @export
 */
export const RatesApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Query exchange rate for THE into the given currency
         * @summary Exchange Rate
         * @param {number} currencyCode The integer code for the countries currency
         * @param {number} timestamp The timestamp we are requesting valid values for
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConversion(currencyCode: number, timestamp: number, options: any = {}): RequestArgs {
            // verify required parameter 'currencyCode' is not null or undefined
            if (currencyCode === null || currencyCode === undefined) {
                throw new RequiredError('currencyCode','Required parameter currencyCode was null or undefined when calling getConversion.');
            }
            // verify required parameter 'timestamp' is not null or undefined
            if (timestamp === null || timestamp === undefined) {
                throw new RequiredError('timestamp','Required parameter timestamp was null or undefined when calling getConversion.');
            }
            const localVarPath = `/rates/{currencyCode}`
                .replace(`{${"currencyCode"}}`, encodeURIComponent(String(currencyCode)));
            const localVarUrlObj = globalImportUrl.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (timestamp !== undefined) {
                localVarQueryParameter['timestamp'] = timestamp;
            }


    
            localVarUrlObj.query = {...localVarUrlObj.query, ...localVarQueryParameter, ...options.query};
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...options.headers};

            return {
                url: globalImportUrl.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * RatesApi - functional programming interface
 * @export
 */
export const RatesApiFp = function(configuration?: Configuration) {
    return {
        /**
         * Query exchange rate for THE into the given currency
         * @summary Exchange Rate
         * @param {number} currencyCode The integer code for the countries currency
         * @param {number} timestamp The timestamp we are requesting valid values for
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConversion(currencyCode: number, timestamp: number, options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<FXRate> {
            const localVarAxiosArgs = RatesApiAxiosParamCreator(configuration).getConversion(currencyCode, timestamp, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * RatesApi - factory interface
 * @export
 */
export const RatesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * Query exchange rate for THE into the given currency
         * @summary Exchange Rate
         * @param {number} currencyCode The integer code for the countries currency
         * @param {number} timestamp The timestamp we are requesting valid values for
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConversion(currencyCode: number, timestamp: number, options?: any): AxiosPromise<FXRate> {
            return RatesApiFp(configuration).getConversion(currencyCode, timestamp, options)(axios, basePath);
        },
    };
};

/**
 * RatesApi - object-oriented interface
 * @export
 * @class RatesApi
 * @extends {BaseAPI}
 */
export class RatesApi extends BaseAPI {
    /**
     * Query exchange rate for THE into the given currency
     * @summary Exchange Rate
     * @param {number} currencyCode The integer code for the countries currency
     * @param {number} timestamp The timestamp we are requesting valid values for
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RatesApi
     */
    public getConversion(currencyCode: number, timestamp: number, options?: any) {
        return RatesApiFp(this.configuration).getConversion(currencyCode, timestamp, options)(this.axios, this.basePath);
    }

}

