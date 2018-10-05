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
import TapCapTransaction from './TapCapTransaction';

/**
 * The TapCapHistoryResponse model module.
 * @module model/TapCapHistoryResponse
 * @version 0.0.1
 */
class TapCapHistoryResponse {
    /**
     * Constructs a new <code>TapCapHistoryResponse</code>.
     * @alias module:model/TapCapHistoryResponse
     * @param history {Array.<module:model/TapCapTransaction>} 
     */
    constructor(history) { 
        
        TapCapHistoryResponse.initialize(this, history);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, history) { 
        obj['history'] = history;
    }

    /**
     * Constructs a <code>TapCapHistoryResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/TapCapHistoryResponse} obj Optional instance to populate.
     * @return {module:model/TapCapHistoryResponse} The populated <code>TapCapHistoryResponse</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new TapCapHistoryResponse();

            if (data.hasOwnProperty('history')) {
                obj['history'] = ApiClient.convertToType(data['history'], [TapCapTransaction]);
            }
        }
        return obj;
    }


}

/**
 * @member {Array.<module:model/TapCapTransaction>} history
 */
TapCapHistoryResponse.prototype['history'] = undefined;






export default TapCapHistoryResponse;

