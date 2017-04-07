# litter-box

A few function memoization helpers to work with [catbox](https://github.com/hapijs/catbox).

[![standard][standard-image]][standard-url]
[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]

[travis-image]: https://travis-ci.org/maxnachlinger/litter-box.svg?branch=master
[travis-url]: https://travis-ci.org/maxnachlinger/litter-box
[npm-image]: https://img.shields.io/npm/v/litter-box.svg?style=flat
[npm-url]: https://npmjs.org/package/litter-box
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/

### Installation:
```
npm i litter-box --save
```

### Initialization
You have to initialize this library with an instance of a catbox client.

``init(catbox-client-instance)``

#### Arguments
* ``catbox-client-instance``: ``object``. Required. An instance of a Catbox Client. 

### Promise Memoization
``memoizeFnPromise(options)``

#### Arguments
* ``options``: ``object``. Required. An object with the following keys:
  * ``fn``: ``Function``. Required. A function which returns a Promise.
  * ``ttl``: ``Integer``. Required. The time-to-live for the cached ``fn`` result.
  * ``keyProvider``: ``(fn-input) => {id, segment}``. Required. A function which returns a cache-key for Catbox. This 
  function is called with the same arguments as ``fn``, allowing you to create a dynamic cache-key, for example: 
```javascript
  const exampleKeyProvider = (input) => ({ segment: 'test', id: `test-${input}` })
```

#### Promise Memoization Example:
This code is also available [here](./example/promise-example.js).
```javascript
'use strict'

const Catbox = require('catbox')
const CatboxMemory = require('catbox-memory')
const litterBox = require('litter-box')

const setupClient = (callback) => {
  const client = new Catbox.Client(CatboxMemory, { maxByteSize: 10485760 })
  return client.start((err) => {
    if (err) {
      return callback(err)
    }
    if (!client.isReady()) {
      return callback(new Error('Cache client is not ready.'))
    }
    return callback(null, client)
  })
}

const onError = (err) => {
  console.error(err)
  process.exit(1)
}

setupClient((err, client) => {
  if (err) {
    return onError(err)
  }

  litterBox.init(client)
  const examplePromiseFunction = (input) => Promise.resolve(input)

  const cachedPromiseFunction = litterBox.memoizeFnPromise({
    fn: examplePromiseFunction,
    keyProvider: (input) => ({ segment: 'test', id: `test-${input}` }),
    ttl: 5 * 60 * 1000 // 5 minutes
  })

  return cachedPromiseFunction(1234)
    .then(() => cachedPromiseFunction(1234)) // uses cached 1234 result
    .catch(onError)
    .then((result) => { // returns 1234
      console.log(result)
      process.exit(0)
    })
})
```
### Callback Memoization
``memoizeFnCallback(options)``

#### Arguments
* ``options``: ``object``. Required. An object with the following keys:
  * ``fn``: ``Function``. Required. A function which has a callback as it's final argument.
  * ``ttl``: ``Integer``. Required. The time-to-live for the cached ``fn`` result.
  * ``keyProvider``: ``(fn-input) => {id, segment}``. Required. A function which returns a cache-key for Catbox. This 
  function is called with the same arguments as ``fn``, allowing you to create a dynamic cache-key, for example: 
```javascript
  const exampleKeyProvider = (input) => ({ segment: 'test', id: `test-${input}` })
```

#### Callback Memoization Example:
This code is also available [here](./example/callback-example.js).
```javascript
'use strict'

const Catbox = require('catbox')
const CatboxMemory = require('catbox-memory')
const litterBox = require('litter-box')

const setupClient = (callback) => {
  const client = new Catbox.Client(CatboxMemory, { maxByteSize: 10485760 })
  return client.start((err) => {
    if (err) {
      return callback(err)
    }
    if (!client.isReady()) {
      return callback(new Error('Cache client is not ready.'))
    }
    return callback(null, client)
  })
}

const onError = (err) => {
  console.error(err)
  process.exit(1)
}

setupClient((err, client) => {
  if (err) {
    return onError(err)
  }

  litterBox.init(client)
  const exampleCallbackFunction = (input, cb) => cb(null, input)

  const cachedCallbackFunction = litterBox.memoizeFnCallback({
    fn: exampleCallbackFunction,
    keyProvider: (input) => ({ segment: 'test', id: `test-${input}` }),
    ttl: 5 * 60 * 1000 // 5 minutes
  })

  return cachedCallbackFunction(1234, (err, result) => {
    if (err) {
      return onError(err)
    }
    return cachedCallbackFunction(1234, (err, result) => { // uses cached 1234 result
      if (err) {
        return onError(err)
      }
      console.log(result)
      process.exit(0)
    })
  })
})
```
