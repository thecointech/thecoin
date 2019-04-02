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
 * The NewAccountReferal model module.
 * @module model/NewAccountReferal
 * @version 0.1.2
 */
class NewAccountReferal {
    /**
     * Constructs a new <code>NewAccountReferal</code>.
     * @alias module:model/NewAccountReferal
     * @param referrerId {String} 
     * @param newAccount {String} 
     */
    constructor(referrerId, newAccount) { 
        
        NewAccountReferal.initialize(this, referrerId, newAccount);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, referrerId, newAccount) { 
        obj['referrerId'] = referrerId;
        obj['newAccount'] = newAccount;
    }

    /**
     * Constructs a <code>NewAccountReferal</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/NewAccountReferal} obj Optional instance to populate.
     * @return {module:model/NewAccountReferal} The populated <code>NewAccountReferal</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new NewAccountReferal();

            if (data.hasOwnProperty('referrerId')) {
                obj['referrerId'] = ApiClient.convertToType(data['referrerId'], 'String');
            }
            if (data.hasOwnProperty('newAccount')) {
                obj['newAccount'] = ApiClient.convertToType(data['newAccount'], 'String');
            }
        }
        return obj;
    }


}

/**
 * @member {String} referrerId
 */
NewAccountReferal.prototype['referrerId'] = undefined;

/**
 * @member {String} newAccount
 */
NewAccountReferal.prototype['newAccount'] = undefined;






export default NewAccountReferal;

