'use strict'

const Catbox = require('catbox')
const CatboxMemory = require('catbox-memory')

module.exports = (callback) => {
  const client = new Catbox.Client(CatboxMemory, { maxByteSize: 2048 })

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
