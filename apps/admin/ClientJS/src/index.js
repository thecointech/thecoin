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


import ApiClient from './ApiClient';
import CertifiedTransferRequest from './model/CertifiedTransferRequest';
import CertifiedTransferResponse from './model/CertifiedTransferResponse';
import PurchaseComplete from './model/PurchaseComplete';
import PurchaseIds from './model/PurchaseIds';
import PurchaseResponse from './model/PurchaseResponse';
import PurchaseState from './model/PurchaseState';
import SellComplete from './model/SellComplete';
import SellRequest from './model/SellRequest';
import SellResponse from './model/SellResponse';
import SignedMessage from './model/SignedMessage';
import SignedPurchaseConfirm from './model/SignedPurchaseConfirm';
import SignedPurchaseRequest from './model/SignedPurchaseRequest';
import PurchaseApi from './api/PurchaseApi';
import SellApi from './api/SellApi';
import TransferApi from './api/TransferApi';


/**
* TheCoin_simple_broker_services___This_sample_API_is_an_example_of_how_to_setup_the_simplest_low_volume_exchange_when_combined_with_the_included_server_code_without_external_dependencies.<br>
* The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
* <p>
* An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
* <pre>
* var @TheCoinBrokerCad = require('index'); // See note below*.
* var xxxSvc = new @TheCoinBrokerCad.XxxApi(); // Allocate the API class we're going to use.
* var yyyModel = new @TheCoinBrokerCad.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
* and put the application logic within the callback function.</em>
* </p>
* <p>
* A non-AMD browser application (discouraged) might do something like this:
* <pre>
* var xxxSvc = new @TheCoinBrokerCad.XxxApi(); // Allocate the API class we're going to use.
* var yyy = new @TheCoinBrokerCad.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* </p>
* @module index
* @version 0.1.0
*/
export {
    /**
     * The ApiClient constructor.
     * @property {module:ApiClient}
     */
    ApiClient,

    /**
     * The CertifiedTransferRequest model constructor.
     * @property {module:model/CertifiedTransferRequest}
     */
    CertifiedTransferRequest,

    /**
     * The CertifiedTransferResponse model constructor.
     * @property {module:model/CertifiedTransferResponse}
     */
    CertifiedTransferResponse,

    /**
     * The PurchaseComplete model constructor.
     * @property {module:model/PurchaseComplete}
     */
    PurchaseComplete,

    /**
     * The PurchaseIds model constructor.
     * @property {module:model/PurchaseIds}
     */
    PurchaseIds,

    /**
     * The PurchaseResponse model constructor.
     * @property {module:model/PurchaseResponse}
     */
    PurchaseResponse,

    /**
     * The PurchaseState model constructor.
     * @property {module:model/PurchaseState}
     */
    PurchaseState,

    /**
     * The SellComplete model constructor.
     * @property {module:model/SellComplete}
     */
    SellComplete,

    /**
     * The SellRequest model constructor.
     * @property {module:model/SellRequest}
     */
    SellRequest,

    /**
     * The SellResponse model constructor.
     * @property {module:model/SellResponse}
     */
    SellResponse,

    /**
     * The SignedMessage model constructor.
     * @property {module:model/SignedMessage}
     */
    SignedMessage,

    /**
     * The SignedPurchaseConfirm model constructor.
     * @property {module:model/SignedPurchaseConfirm}
     */
    SignedPurchaseConfirm,

    /**
     * The SignedPurchaseRequest model constructor.
     * @property {module:model/SignedPurchaseRequest}
     */
    SignedPurchaseRequest,

    /**
    * The PurchaseApi service constructor.
    * @property {module:api/PurchaseApi}
    */
    PurchaseApi,

    /**
    * The SellApi service constructor.
    * @property {module:api/SellApi}
    */
    SellApi,

    /**
    * The TransferApi service constructor.
    * @property {module:api/TransferApi}
    */
    TransferApi
};
