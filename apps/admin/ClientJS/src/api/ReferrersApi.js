/**
 * THE Coin Broker Sample
 * TheCoin simple broker services.  This sample API is an example of how to setup the simplest low-volume exchange, when combined with the included server code, without external dependencies
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
import NewAccountReferal from '../model/NewAccountReferal';

/**
* Referrers service.
* @module api/ReferrersApi
* @version 0.1.2
*/
export default class ReferrersApi {

    /**
    * Constructs a new ReferrersApi. 
    * @alias module:api/ReferrersApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }



    /**
     * Register the referral of new account
     * Returns a boolean indicating whether the passed referrer is valid
     * @param {module:model/NewAccountReferal} newAccountReferal Set referal for new account
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Boolean} and HTTP response
     */
    referralCreateWithHttpInfo(newAccountReferal) {
      let postBody = newAccountReferal;

      // verify the required parameter 'newAccountReferal' is set
      if (newAccountReferal === undefined || newAccountReferal === null) {
        throw new Error("Missing the required parameter 'newAccountReferal' when calling referralCreate");
      }


      let pathParams = {
      };
      let queryParams = {
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = ['application/json'];
      let accepts = ['application/json'];
      let returnType = 'Boolean';

      return this.apiClient.callApi(
        '/referrers', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Register the referral of new account
     * Returns a boolean indicating whether the passed referrer is valid
     * @param {module:model/NewAccountReferal} newAccountReferal Set referal for new account
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Boolean}
     */
    referralCreate(newAccountReferal) {
      return this.referralCreateWithHttpInfo(newAccountReferal)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


    /**
     * Gets the validity of the passed referrer
     * Returns a boolean indicating whether the passed referrer is valid
     * @param {String} referrer Referrers ID.  This ID must have been previously registered with the system
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Boolean} and HTTP response
     */
    referrerValidWithHttpInfo(referrer) {
      let postBody = null;

      // verify the required parameter 'referrer' is set
      if (referrer === undefined || referrer === null) {
        throw new Error("Missing the required parameter 'referrer' when calling referrerValid");
      }


      let pathParams = {
      };
      let queryParams = {
        'referrer': referrer
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = 'Boolean';

      return this.apiClient.callApi(
        '/referrers', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Gets the validity of the passed referrer
     * Returns a boolean indicating whether the passed referrer is valid
     * @param {String} referrer Referrers ID.  This ID must have been previously registered with the system
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Boolean}
     */
    referrerValid(referrer) {
      return this.referrerValidWithHttpInfo(referrer)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


}
