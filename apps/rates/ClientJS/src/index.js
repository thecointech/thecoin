/**
 * TheCoin Core
 * TheCoin pricing service.  Published by TheCoin Tech
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
import FXRate from './model/FXRate';
import RatesApi from './api/RatesApi';


/**
* TheCoin_pricing_service___Published_by_TheCoin_Tech.<br>
* The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
* <p>
* An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
* <pre>
* var @TheCoinPricing = require('index'); // See note below*.
* var xxxSvc = new @TheCoinPricing.XxxApi(); // Allocate the API class we're going to use.
* var yyyModel = new @TheCoinPricing.Yyy(); // Construct a model instance.
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
* var xxxSvc = new @TheCoinPricing.XxxApi(); // Allocate the API class we're going to use.
* var yyy = new @TheCoinPricing.Yyy(); // Construct a model instance.
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
     * The FXRate model constructor.
     * @property {module:model/FXRate}
     */
    FXRate,

    /**
    * The RatesApi service constructor.
    * @property {module:api/RatesApi}
    */
    RatesApi
};
