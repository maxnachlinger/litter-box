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

### Promise Memoization
``litterBox.memoizeFnPromise(options)``

#### Arguments
* ``options``: ``object``. Required. An object with the following keys:
  * ``client``: ``Catbox Client Instance``. Required. A catbox client instance.
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
const litterBox = require('litter-box')

const examplePromiseFunction = (input) => Promise.resolve(input)

const cachedPromiseFunction = litterBox.memoizeFnPromise({
  client: catboxClientInstance,
  fn: examplePromiseFunction,
  keyProvider: (input) => ({ segment: 'test', id: `test-${input}` }),
  ttl: 5 * 60 * 1000 // 5 minutes
})

cachedPromiseFunction(1234)
  .then(console.log) // prints 1234

// later on...
cachedPromiseFunction(1234) // function not executed, value is pulled from the cache
  .then((result) => { // returns 1234
    console.log(result)
    process.exit(0)
  })
```
### Callback Memoization
``litterBox.memoizeFnCallback(options)``

#### Arguments
* ``options``: ``object``. Required. An object with the following keys:
  * ``client``: ``Catbox Client Instance``. Required. A catbox client instance.
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
const litterBox = require('litter-box')

const exampleCallbackFunction = (input, cb) => cb(null, input)

const cachedPromiseFunction = litterBox.memoizeFnPromise({
  client: catboxClientInstance,
  fn: exampleCallbackFunction,
  keyProvider: (input) => ({ segment: 'test', id: `test-${input}` }),
  ttl: 5 * 60 * 1000 // 5 minutes
})

cachedCallbackFunction(1234, (err, result) => console.log(result)) // prints 1234

// later on...

// function not executed, value is pulled from the cache
cachedCallbackFunction(1234, (err, result) => console.log(result)) // prints 1234
```
