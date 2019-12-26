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
    factory(root.expect, root.TheBrokerCad);
  }
}(this, function(expect, TheBrokerCad) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new TheBrokerCad.PurchaseState();
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

  describe('PurchaseState', function() {
    it('should create an instance of PurchaseState', function() {
      // uncomment below and update the code to test PurchaseState
      //var instane = new TheBrokerCad.PurchaseState();
      //expect(instance).to.be.a(TheBrokerCad.PurchaseState);
    });

    it('should have the property request (base name: "request")', function() {
      // uncomment below and update the code to test the property request
      //var instane = new TheBrokerCad.PurchaseState();
      //expect(instance).to.be();
    });

    it('should have the property confirm (base name: "confirm")', function() {
      // uncomment below and update the code to test the property confirm
      //var instane = new TheBrokerCad.PurchaseState();
      //expect(instance).to.be();
    });

    it('should have the property complete (base name: "complete")', function() {
      // uncomment below and update the code to test the property complete
      //var instane = new TheBrokerCad.PurchaseState();
      //expect(instance).to.be();
    });

  });

}));
