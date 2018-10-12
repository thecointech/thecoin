/**
 * TheCoin Broker
 * TheCoin TapCap resolution.  This service is the trusted 3rd party that weekly settles TapCap purchases
 *
 * OpenAPI spec version: 0.0.1
 * Contact: stephen.taylor.dev@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */


import ApiClient from "../ApiClient";
import SignedMessage from '../model/SignedMessage';

/**
* Transactions service.
* @module api/TransactionsApi
* @version 0.0.1
*/
export default class TransactionsApi {

    /**
    * Constructs a new TransactionsApi. 
    * @alias module:api/TransactionsApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }



    /**
     * Broker: Register new TapCap transaction
     * @param {module:model/SignedMessage} signedMessage TapCap exchange request
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link Object} and HTTP response
     */
    tapCapBrokerWithHttpInfo(signedMessage) {
      let postBody = signedMessage;

      // verify the required parameter 'signedMessage' is set
      if (signedMessage === undefined || signedMessage === null) {
        throw new Error("Missing the required parameter 'signedMessage' when calling tapCapBroker");
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
      let returnType = Object;

      return this.apiClient.callApi(
        '/tap/broker', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Broker: Register new TapCap transaction
     * @param {module:model/SignedMessage} signedMessage TapCap exchange request
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link Object}
     */
    tapCapBroker(signedMessage) {
      return this.tapCapBrokerWithHttpInfo(signedMessage)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


    /**
     * Client: Confirm new TapCap transaction
     * @param {module:model/SignedMessage} signedMessage TapCap status request
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/SignedMessage} and HTTP response
     */
    tapCapClientWithHttpInfo(signedMessage) {
      let postBody = signedMessage;

      // verify the required parameter 'signedMessage' is set
      if (signedMessage === undefined || signedMessage === null) {
        throw new Error("Missing the required parameter 'signedMessage' when calling tapCapClient");
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
      let returnType = SignedMessage;

      return this.apiClient.callApi(
        '/tap/client', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Client: Confirm new TapCap transaction
     * @param {module:model/SignedMessage} signedMessage TapCap status request
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/SignedMessage}
     */
    tapCapClient(signedMessage) {
      return this.tapCapClientWithHttpInfo(signedMessage)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


}
