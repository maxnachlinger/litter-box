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

  const exampleCallbackFunction = (input, cb) => cb(null, input)

  const cachedCallbackFunction = litterBox.memoizeFnCallback({
    client,
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
