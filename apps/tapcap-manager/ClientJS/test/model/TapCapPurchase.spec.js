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
    instance = new TapcapManager.TapCapPurchase();
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

  describe('TapCapPurchase', function() {
    it('should create an instance of TapCapPurchase', function() {
      // uncomment below and update the code to test TapCapPurchase
      //var instane = new TapcapManager.TapCapPurchase();
      //expect(instance).to.be.a(TapcapManager.TapCapPurchase);
    });

    it('should have the property fiat (base name: "fiat")', function() {
      // uncomment below and update the code to test the property fiat
      //var instane = new TapcapManager.TapCapPurchase();
      //expect(instance).to.be();
    });

    it('should have the property currencyCode (base name: "currencyCode")', function() {
      // uncomment below and update the code to test the property currencyCode
      //var instane = new TapcapManager.TapCapPurchase();
      //expect(instance).to.be();
    });

    it('should have the property timestamp (base name: "timestamp")', function() {
      // uncomment below and update the code to test the property timestamp
      //var instane = new TapcapManager.TapCapPurchase();
      //expect(instance).to.be();
    });

    it('should have the property gpoData (base name: "gpoData")', function() {
      // uncomment below and update the code to test the property gpoData
      //var instane = new TapcapManager.TapCapPurchase();
      //expect(instance).to.be();
    });

    it('should have the property certificateRequest (base name: "certificateRequest")', function() {
      // uncomment below and update the code to test the property certificateRequest
      //var instane = new TapcapManager.TapCapPurchase();
      //expect(instance).to.be();
    });

    it('should have the property token (base name: "token")', function() {
      // uncomment below and update the code to test the property token
      //var instane = new TapcapManager.TapCapPurchase();
      //expect(instance).to.be();
    });

  });

}));
