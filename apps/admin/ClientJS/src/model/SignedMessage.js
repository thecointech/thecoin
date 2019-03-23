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
 * The SignedMessage model module.
 * @module model/SignedMessage
 * @version 0.1.2
 */
class SignedMessage {
    /**
     * Constructs a new <code>SignedMessage</code>.
     * @alias module:model/SignedMessage
     * @param message {String} 
     * @param signature {String} 
     */
    constructor(message, signature) { 
        
        SignedMessage.initialize(this, message, signature);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, message, signature) { 
        obj['message'] = message;
        obj['signature'] = signature;
    }

    /**
     * Constructs a <code>SignedMessage</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/SignedMessage} obj Optional instance to populate.
     * @return {module:model/SignedMessage} The populated <code>SignedMessage</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new SignedMessage();

            if (data.hasOwnProperty('message')) {
                obj['message'] = ApiClient.convertToType(data['message'], 'String');
            }
            if (data.hasOwnProperty('signature')) {
                obj['signature'] = ApiClient.convertToType(data['signature'], 'String');
            }
        }
        return obj;
    }


}

/**
 * @member {String} message
 */
SignedMessage.prototype['message'] = undefined;

/**
 * @member {String} signature
 */
SignedMessage.prototype['signature'] = undefined;






export default SignedMessage;

