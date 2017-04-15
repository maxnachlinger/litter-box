'use strict'

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
      return callback()
    })
  }

  t.test('Setup', (t) => reset(t.end))

  t.test('caches a promise-returning function', (t) => {
    const input = 1000
    const fn = sandbox.stub().returns(Promise.resolve(input))

    const cachedFn = lib.memoizeFnPromise({
      client,
      fn,
      keyProvider: (input) => ({ segment: 'test', id: `test-${input}` }),
      ttl: 500
    }) // function() {}

    return cachedFn(1000)
      .then((result) => {
        t.equal(result, input, 'Should return valid input')
      })
      .then(() => cachedFn(1000))
      .then((result) => {
        t.equal(result, input, 'Should return valid input')
      })
      .catch(t.fail)
      .then(() => {
        t.ok(fn.calledOnce, 'Function should only be called once')
        t.end()
      })
  })

  t.test('Setup', (t) => reset(t.end))

  t.test('does not cache a promise-returning function returning an error', (t) => {
    const fn = sandbox.stub().returns(Promise.reject(new Error('test')))
    const cachedFn = lib.memoizeFnPromise({
      client,
      fn,
      keyProvider: (input) => ({ segment: 'test', id: `test-${input}` }),
      ttl: 500
    }) // function() {}

    return cachedFn(1000)
      .then(() => cachedFn(1000))
      .catch((err) => {
        t.ok(err, 'An error should be returned')
        t.ok(fn.calledOnce, 'Function should only be called once')
        t.end()
      })
  })
})
