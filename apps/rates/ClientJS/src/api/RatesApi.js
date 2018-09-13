/**
 * TheCoin Core
 * TheCoin core services.  Published by TheCoin Tech
 *
 * OpenAPI spec version: 0.1.0
 * Contact: stephen.taylor.dev@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */


import ApiClient from "../ApiClient";
import FXRate from '../model/FXRate';

/**
* Rates service.
* @module api/RatesApi
* @version 0.1.0
*/
export default class RatesApi {

    /**
    * Constructs a new RatesApi. 
    * @alias module:api/RatesApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }



    /**
     * Exchange Rate
     * Query exchange rate for THE into the given currency
     * @param {Number} currencyCode The integer code for the countries currency
     * @param {Number} timestamp The timestamp we are requesting valid values for
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/FXRate} and HTTP response
     */
    getConversionWithHttpInfo(currencyCode, timestamp) {
      let postBody = null;

      // verify the required parameter 'currencyCode' is set
      if (currencyCode === undefined || currencyCode === null) {
        throw new Error("Missing the required parameter 'currencyCode' when calling getConversion");
      }

      // verify the required parameter 'timestamp' is set
      if (timestamp === undefined || timestamp === null) {
        throw new Error("Missing the required parameter 'timestamp' when calling getConversion");
      }


      let pathParams = {
        'currencyCode': currencyCode
      };
      let queryParams = {
        'timestamp': timestamp
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = FXRate;

      return this.apiClient.callApi(
        '/rates/{currencyCode}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Exchange Rate
     * Query exchange rate for THE into the given currency
     * @param {Number} currencyCode The integer code for the countries currency
     * @param {Number} timestamp The timestamp we are requesting valid values for
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/FXRate}
     */
    getConversion(currencyCode, timestamp) {
      return this.getConversionWithHttpInfo(currencyCode, timestamp)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


}
