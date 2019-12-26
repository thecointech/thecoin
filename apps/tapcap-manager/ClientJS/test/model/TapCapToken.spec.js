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

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', '../../src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require('../../src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.@TheCoinTapcapManager);
  }
}(this, function(expect, @TheCoinTapcapManager) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new @TheCoinTapcapManager.TapCapToken();
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

  describe('TapCapToken', function() {
    it('should create an instance of TapCapToken', function() {
      // uncomment below and update the code to test TapCapToken
      //var instane = new @TheCoinTapcapManager.TapCapToken();
      //expect(instance).to.be.a(@TheCoinTapcapManager.TapCapToken);
    });

    it('should have the property clientAccount (base name: "clientAccount")', function() {
      // uncomment below and update the code to test the property clientAccount
      //var instane = new @TheCoinTapcapManager.TapCapToken();
      //expect(instance).to.be();
    });

    it('should have the property availableBalance (base name: "availableBalance")', function() {
      // uncomment below and update the code to test the property availableBalance
      //var instane = new @TheCoinTapcapManager.TapCapToken();
      //expect(instance).to.be();
    });

    it('should have the property nonce (base name: "nonce")', function() {
      // uncomment below and update the code to test the property nonce
      //var instane = new @TheCoinTapcapManager.TapCapToken();
      //expect(instance).to.be();
    });

    it('should have the property timestamp (base name: "timestamp")', function() {
      // uncomment below and update the code to test the property timestamp
      //var instane = new @TheCoinTapcapManager.TapCapToken();
      //expect(instance).to.be();
    });

  });

}));
