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

import ApiClient from '../ApiClient';

/**
 * The PurchaseResponse model module.
 * @module model/PurchaseResponse
 * @version 0.1.2
 */
class PurchaseResponse {
    /**
     * Constructs a new <code>PurchaseResponse</code>.
     * @alias module:model/PurchaseResponse
     * @param orderId {String} 
     */
    constructor(orderId) { 
        
        PurchaseResponse.initialize(this, orderId);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, orderId) { 
        obj['orderId'] = orderId;
    }

    /**
     * Constructs a <code>PurchaseResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/PurchaseResponse} obj Optional instance to populate.
     * @return {module:model/PurchaseResponse} The populated <code>PurchaseResponse</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new PurchaseResponse();

            if (data.hasOwnProperty('orderId')) {
                obj['orderId'] = ApiClient.convertToType(data['orderId'], 'String');
            }
        }
        return obj;
    }


}

/**
 * @member {String} orderId
 */
PurchaseResponse.prototype['orderId'] = undefined;






export default PurchaseResponse;

