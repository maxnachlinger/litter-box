'use strict'

const cacheFunctionCallback = require('./cache-function-callback')
const cacheFunctionPromise = require('./cache-function-promise')

module.exports.memoizeFnCallback = cacheFunctionCallback
module.exports.memoizeFnPromise = cacheFunctionPromise
