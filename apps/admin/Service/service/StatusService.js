'use strict';

const BrokerActions = require('../exchange/Broker')
/**
 * Gets the operating status of the broker
 * Returns info like brokers address, available balance, etc (?)
 *
 * returns BrokerStatus
 **/
exports.status = function() {
  return new Promise(function(resolve, reject) {
    var status = BrokerActions.ServerStatus();
    resolve(status);
  });
}

