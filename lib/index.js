'use strict'

const cacheFunctionCallback = require('./cache-function-callback')
const cacheFunctionPromise = require('./cache-function-promise')

module.exports.init = (catboxClient) => {
  module.exports.memoizeFnCallback = cacheFunctionCallback(catboxClient)
  module.exports.memoizeFnPromise = cacheFunctionPromise(catboxClient)
}
