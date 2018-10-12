/**
 * The TapCap Manager
 * The TapCap resolution.  This service is the trusted 3rd party that weekly settles TapCap purchases
 *
 * OpenAPI spec version: 0.0.1
 * Contact: stephen.taylor.dev@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

import ApiClient from '../ApiClient';
import SignedMessage from './SignedMessage';

/**
 * The TapCapPurchaseBroker model module.
 * @module model/TapCapPurchaseBroker
 * @version 0.0.1
 */
class TapCapPurchaseBroker {
    /**
     * Constructs a new <code>TapCapPurchaseBroker</code>.
     * @alias module:model/TapCapPurchaseBroker
     * @param clientRequest {module:model/SignedMessage} 
     * @param coin {Number} 
     * @param cert {String} 
     */
    constructor(clientRequest, coin, cert) { 
        
        TapCapPurchaseBroker.initialize(this, clientRequest, coin, cert);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, clientRequest, coin, cert) { 
        obj['clientRequest'] = clientRequest;
        obj['coin'] = coin;
        obj['cert'] = cert;
    }

    /**
     * Constructs a <code>TapCapPurchaseBroker</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/TapCapPurchaseBroker} obj Optional instance to populate.
     * @return {module:model/TapCapPurchaseBroker} The populated <code>TapCapPurchaseBroker</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new TapCapPurchaseBroker();

            if (data.hasOwnProperty('clientRequest')) {
                obj['clientRequest'] = SignedMessage.constructFromObject(data['clientRequest']);
            }
            if (data.hasOwnProperty('coin')) {
                obj['coin'] = ApiClient.convertToType(data['coin'], 'Number');
            }
            if (data.hasOwnProperty('cert')) {
                obj['cert'] = ApiClient.convertToType(data['cert'], 'String');
            }
        }
        return obj;
    }


}

/**
 * @member {module:model/SignedMessage} clientRequest
 */
TapCapPurchaseBroker.prototype['clientRequest'] = undefined;

/**
 * @member {Number} coin
 */
TapCapPurchaseBroker.prototype['coin'] = undefined;

/**
 * @member {String} cert
 */
TapCapPurchaseBroker.prototype['cert'] = undefined;






export default TapCapPurchaseBroker;

