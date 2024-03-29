'use strict';

// Taken from: https://github.com/joscha/less-vars-loader
// with a few improvements to support automatically casting to number etc
const lessToJs = require('less-vars-to-js');
const camelcase = require('camelcase');
const loaderUtils = require('loader-utils');
const entries = require('object.entries');
const fs = require('fs');

module.exports = function(source) {
  this.cacheable && this.cacheable();
  const query = loaderUtils.parseQuery(this.query);
  const camelCaseKeys = !!(query.camelCase || query.camelcase);
  const resolveVariables = query.resolveVariables === false || true; //!!(query.resolveVariables || query.resolvevariables);

  const varRgx = /^@/;
  const vars = lessToJs(source);
  const keys = Object.keys(vars);
  if (!keys.length) {
    this.emitWarning('Could not find any extractable less variables!');
  }

  if (resolveVariables) {
      const followVar = (value) => {
        if (varRgx.test(value)) {
          // value is a variable
          return followVar(vars[value]);
        }
        return value;
      }
      entries(vars).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];
        vars[key] = followVar(value);
      });
  }

  const transformKey = (key) => {
      let ret = key.replace(varRgx, '');
      if (camelCaseKeys) {
        ret = camelcase(ret);
      }
      return ret;
  }

  const cleanedVars = keys.reduce((prev, key) => {
    const val = Number(vars[key]) || vars[key];
    prev[transformKey(key)] = val;
    return prev;
  }, {});

  return `module.exports = ${JSON.stringify(cleanedVars, null, 2)};\n`;
};
