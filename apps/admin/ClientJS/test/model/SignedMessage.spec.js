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
    instance = new TheBrokerCad.SignedMessage();
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

  describe('SignedMessage', function() {
    it('should create an instance of SignedMessage', function() {
      // uncomment below and update the code to test SignedMessage
      //var instane = new TheBrokerCad.SignedMessage();
      //expect(instance).to.be.a(TheBrokerCad.SignedMessage);
    });

    it('should have the property message (base name: "message")', function() {
      // uncomment below and update the code to test the property message
      //var instane = new TheBrokerCad.SignedMessage();
      //expect(instance).to.be();
    });

    it('should have the property signature (base name: "signature")', function() {
      // uncomment below and update the code to test the property signature
      //var instane = new TheBrokerCad.SignedMessage();
      //expect(instance).to.be();
    });

  });

}));
