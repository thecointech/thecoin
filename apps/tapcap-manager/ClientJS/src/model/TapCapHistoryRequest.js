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

import ApiClient from '../ApiClient';

/**
 * The TapCapHistoryRequest model module.
 * @module model/TapCapHistoryRequest
 * @version 0.0.1
 */
class TapCapHistoryRequest {
    /**
     * Constructs a new <code>TapCapHistoryRequest</code>.
     * @alias module:model/TapCapHistoryRequest
     * @param fromTimestamp {Number} 
     * @param untilTimestamp {Number} 
     * @param msgTimestamp {Number} 
     */
    constructor(fromTimestamp, untilTimestamp, msgTimestamp) { 
        
        TapCapHistoryRequest.initialize(this, fromTimestamp, untilTimestamp, msgTimestamp);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, fromTimestamp, untilTimestamp, msgTimestamp) { 
        obj['fromTimestamp'] = fromTimestamp;
        obj['untilTimestamp'] = untilTimestamp;
        obj['msgTimestamp'] = msgTimestamp;
    }

    /**
     * Constructs a <code>TapCapHistoryRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/TapCapHistoryRequest} obj Optional instance to populate.
     * @return {module:model/TapCapHistoryRequest} The populated <code>TapCapHistoryRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new TapCapHistoryRequest();

            if (data.hasOwnProperty('fromTimestamp')) {
                obj['fromTimestamp'] = ApiClient.convertToType(data['fromTimestamp'], 'Number');
            }
            if (data.hasOwnProperty('untilTimestamp')) {
                obj['untilTimestamp'] = ApiClient.convertToType(data['untilTimestamp'], 'Number');
            }
            if (data.hasOwnProperty('msgTimestamp')) {
                obj['msgTimestamp'] = ApiClient.convertToType(data['msgTimestamp'], 'Number');
            }
        }
        return obj;
    }


}

/**
 * @member {Number} fromTimestamp
 */
TapCapHistoryRequest.prototype['fromTimestamp'] = undefined;

/**
 * @member {Number} untilTimestamp
 */
TapCapHistoryRequest.prototype['untilTimestamp'] = undefined;

/**
 * @member {Number} msgTimestamp
 */
TapCapHistoryRequest.prototype['msgTimestamp'] = undefined;






export default TapCapHistoryRequest;

