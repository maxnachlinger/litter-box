'use strict'

const async = require('async')
const sinon = require('sinon')
const test = require('tape')
const lib = require('../lib')
const setupCatbox = require('./util/setup-catbox')

test('Unit: cache-function-callback', (t) => {
  let sandbox
  let client

  const reset = (callback) => {
    if (client) {
      client.stop()
    }
    sandbox = sinon.sandbox.create()
    return setupCatbox((err, clientResult) => {
      if (err) {
        return callback(err)
      }
      client = clientResult
      lib.init(clientResult)
      return callback()
    })
  }

  t.test('Setup', (t) => reset(t.end))

  t.test('caches a callback-returning function', (t) => {
    const input = 1000
    const fn = sandbox.stub().yields(null, input)

    const cachedFn = lib.memoizeFnCallback({
      fn,
      keyProvider: (input) => ({ segment: 'test', id: `test-${input}` }),
      ttl: 1000
    }) // function() {}

    return async.series([
      (callback) => cachedFn(input, callback),
      (callback) => cachedFn(input, callback)
    ], (err, result) => {
      t.notOk(err, 'No error is returned')
      t.ok(fn.calledOnce, 'Function should only be called once')
      t.deepEqual(result, [input, input], 'Shoulo return valid output')
      t.end()
    })
  })

  t.test('Setup', (t) => reset(t.end))

  t.test('does not cache a callback-returning function returning an error', (t) => {
    const fn = sandbox.stub().yields(new Error('test'))
    const cachedFn = lib.memoizeFnCallback({
      fn,
      keyProvider: (input) => ({ segment: 'test-error', id: `test-error-${input}` }),
      ttl: 1000
    }) // function() {}

    return async.series([
      (callback) => cachedFn(1000, callback),
      (callback) => cachedFn(1000, callback)
    ], (err) => {
      t.ok(err, 'An error should be returned')
      t.ok(fn.calledOnce, 'Function should only be called once')
      t.end()
    })
  })
})
