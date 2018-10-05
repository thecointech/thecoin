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

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', '../../src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require('../../src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.TapcapManager);
  }
}(this, function(expect, TapcapManager) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new TapcapManager.TapCapPurchaseBroker();
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

  describe('TapCapPurchaseBroker', function() {
    it('should create an instance of TapCapPurchaseBroker', function() {
      // uncomment below and update the code to test TapCapPurchaseBroker
      //var instane = new TapcapManager.TapCapPurchaseBroker();
      //expect(instance).to.be.a(TapcapManager.TapCapPurchaseBroker);
    });

    it('should have the property clientRequest (base name: "clientRequest")', function() {
      // uncomment below and update the code to test the property clientRequest
      //var instane = new TapcapManager.TapCapPurchaseBroker();
      //expect(instance).to.be();
    });

    it('should have the property coin (base name: "coin")', function() {
      // uncomment below and update the code to test the property coin
      //var instane = new TapcapManager.TapCapPurchaseBroker();
      //expect(instance).to.be();
    });

    it('should have the property cert (base name: "cert")', function() {
      // uncomment below and update the code to test the property cert
      //var instane = new TapcapManager.TapCapPurchaseBroker();
      //expect(instance).to.be();
    });

  });

}));
