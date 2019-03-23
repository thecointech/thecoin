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
import PurchaseIds from '../model/PurchaseIds';
import PurchaseResponse from '../model/PurchaseResponse';
import PurchaseState from '../model/PurchaseState';
import SignedMessage from '../model/SignedMessage';
import SignedPurchaseConfirm from '../model/SignedPurchaseConfirm';
import SignedPurchaseRequest from '../model/SignedPurchaseRequest';

/**
* Purchase service.
* @module api/PurchaseApi
* @version 0.1.2
*/
export default class PurchaseApi {

    /**
    * Constructs a new PurchaseApi. 
    * @alias module:api/PurchaseApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }



    /**
     * Mark buy order complete
     * Called by the broker to confirm CAD was deposited and coin disbursed
     * @param {String} user User address
     * @param {Number} id Id of purchase order to complete
     * @param {module:model/SignedMessage} signedMessage Signed PurchaseComplete
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PurchaseResponse} and HTTP response
     */
    completeCoinPurchaseWithHttpInfo(user, id, signedMessage) {
      let postBody = signedMessage;

      // verify the required parameter 'user' is set
      if (user === undefined || user === null) {
        throw new Error("Missing the required parameter 'user' when calling completeCoinPurchase");
      }

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling completeCoinPurchase");
      }

      // verify the required parameter 'signedMessage' is set
      if (signedMessage === undefined || signedMessage === null) {
        throw new Error("Missing the required parameter 'signedMessage' when calling completeCoinPurchase");
      }


      let pathParams = {
        'user': user,
        'id': id
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
      let returnType = PurchaseResponse;

      return this.apiClient.callApi(
        '/exchange/buy/{user}/{id}/complete', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Mark buy order complete
     * Called by the broker to confirm CAD was deposited and coin disbursed
     * @param {String} user User address
     * @param {Number} id Id of purchase order to complete
     * @param {module:model/SignedMessage} signedMessage Signed PurchaseComplete
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PurchaseResponse}
     */
    completeCoinPurchase(user, id, signedMessage) {
      return this.completeCoinPurchaseWithHttpInfo(user, id, signedMessage)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


    /**
     * Confirm order opened
     * Called by the Broker once e-transfer initiated
     * @param {String} user User address
     * @param {Number} id Id of purchase order to return
     * @param {module:model/SignedPurchaseConfirm} signedPurchaseConfirm Signed buy order confirm
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PurchaseResponse} and HTTP response
     */
    confirmCoinPurchaseWithHttpInfo(user, id, signedPurchaseConfirm) {
      let postBody = signedPurchaseConfirm;

      // verify the required parameter 'user' is set
      if (user === undefined || user === null) {
        throw new Error("Missing the required parameter 'user' when calling confirmCoinPurchase");
      }

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling confirmCoinPurchase");
      }

      // verify the required parameter 'signedPurchaseConfirm' is set
      if (signedPurchaseConfirm === undefined || signedPurchaseConfirm === null) {
        throw new Error("Missing the required parameter 'signedPurchaseConfirm' when calling confirmCoinPurchase");
      }


      let pathParams = {
        'user': user,
        'id': id
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
      let returnType = PurchaseResponse;

      return this.apiClient.callApi(
        '/exchange/buy/{user}/{id}/confirm', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Confirm order opened
     * Called by the Broker once e-transfer initiated
     * @param {String} user User address
     * @param {Number} id Id of purchase order to return
     * @param {module:model/SignedPurchaseConfirm} signedPurchaseConfirm Signed buy order confirm
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PurchaseResponse}
     */
    confirmCoinPurchase(user, id, signedPurchaseConfirm) {
      return this.confirmCoinPurchaseWithHttpInfo(user, id, signedPurchaseConfirm)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


    /**
     * Query open buy orders
     * Called by the broker to retrieve all open buy orders.
     * @param {String} user User address
     * @param {Number} id Id of purchase order to return
     * @param {Object} opts Optional parameters
     * @param {String} opts.state Numerical state identifier.  If not present, all states will be returned
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PurchaseState} and HTTP response
     */
    queryCoinPurchaseWithHttpInfo(user, id, opts) {
      opts = opts || {};
      let postBody = null;

      // verify the required parameter 'user' is set
      if (user === undefined || user === null) {
        throw new Error("Missing the required parameter 'user' when calling queryCoinPurchase");
      }

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling queryCoinPurchase");
      }


      let pathParams = {
        'user': user,
        'id': id
      };
      let queryParams = {
        'state': opts['state']
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = PurchaseState;

      return this.apiClient.callApi(
        '/exchange/buy/{user}/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Query open buy orders
     * Called by the broker to retrieve all open buy orders.
     * @param {String} user User address
     * @param {Number} id Id of purchase order to return
     * @param {Object} opts Optional parameters
     * @param {String} opts.state Numerical state identifier.  If not present, all states will be returned
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PurchaseState}
     */
    queryCoinPurchase(user, id, opts) {
      return this.queryCoinPurchaseWithHttpInfo(user, id, opts)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


    /**
     * Query buy order id&#39;s
     * Called by the broker to retrieve all buy orders ID&#39;s in the passed state.
     * @param {Number} state Numerical state identifier.  Returned array will be all of type state
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PurchaseIds} and HTTP response
     */
    queryCoinPurchasesIdsWithHttpInfo(state) {
      let postBody = null;

      // verify the required parameter 'state' is set
      if (state === undefined || state === null) {
        throw new Error("Missing the required parameter 'state' when calling queryCoinPurchasesIds");
      }


      let pathParams = {
      };
      let queryParams = {
        'state': state
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = PurchaseIds;

      return this.apiClient.callApi(
        '/exchange/buy/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Query buy order id&#39;s
     * Called by the broker to retrieve all buy orders ID&#39;s in the passed state.
     * @param {Number} state Numerical state identifier.  Returned array will be all of type state
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PurchaseIds}
     */
    queryCoinPurchasesIds(state) {
      return this.queryCoinPurchasesIdsWithHttpInfo(state)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


    /**
     * Request to buy Coin
     * Called by the client to exchange CAD for coin
     * @param {module:model/SignedPurchaseRequest} signedPurchaseRequest Signed buy order request
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/PurchaseResponse} and HTTP response
     */
    requestCoinPurchaseWithHttpInfo(signedPurchaseRequest) {
      let postBody = signedPurchaseRequest;

      // verify the required parameter 'signedPurchaseRequest' is set
      if (signedPurchaseRequest === undefined || signedPurchaseRequest === null) {
        throw new Error("Missing the required parameter 'signedPurchaseRequest' when calling requestCoinPurchase");
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
      let returnType = PurchaseResponse;

      return this.apiClient.callApi(
        '/exchange/buy/initiate', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }

    /**
     * Request to buy Coin
     * Called by the client to exchange CAD for coin
     * @param {module:model/SignedPurchaseRequest} signedPurchaseRequest Signed buy order request
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:model/PurchaseResponse}
     */
    requestCoinPurchase(signedPurchaseRequest) {
      return this.requestCoinPurchaseWithHttpInfo(signedPurchaseRequest)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }


}
