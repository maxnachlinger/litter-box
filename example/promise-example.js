'use strict'

const Catbox = require('catbox')
const CatboxMemory = require('catbox-memory')
const litterBox = require('../')

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

  const examplePromiseFunction = (input) => Promise.resolve(input)

  const cachedPromiseFunction = litterBox.memoizeFnPromise({
    client,
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
