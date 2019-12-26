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

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', '../../src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require('../../src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.@TheCoinBrokerCad);
  }
}(this, function(expect, @TheCoinBrokerCad) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new @TheCoinBrokerCad.TransferApi();
  });

  var getProperty = function(object, getter, property) {
    // Use getter method if present; otherwise, get the property directly.
    if (typeof object[getter] === 'function')
      return object[getter]();
    else
      return object[property];
  }

  var setProperty = function(object, setter, property, value) {
    // Use setter method if present; otherwise, set the property directly.
    if (typeof object[setter] === 'function')
      object[setter](value);
    else
      object[property] = value;
  }

  describe('TransferApi', function() {
    describe('makeCertifiedTransfer', function() {
      it('should call makeCertifiedTransfer successfully', function(done) {
        //uncomment below and update the code to test makeCertifiedTransfer
        //instance.makeCertifiedTransfer(function(error) {
        //  if (error) throw error;
        //expect().to.be();
        //});
        done();
      });
    });
  });

}));
