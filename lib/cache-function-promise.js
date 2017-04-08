'use strict'

const checkOptions = require('./check-options')

// using function() to get arguments (to support < node-6) else I'd use spread :)
module.exports = (options) => {
  checkOptions(options)

  const client = options.client
  const fn = options.fn
  const keyProvider = options.keyProvider
  const ttl = options.ttl

  return function () {
    // promisify a few methods to make the code below simpler
    const getByKey = (key) => new Promise((resolve, reject) => {
      return client.get(key, (err, result) => err ? reject(err) : resolve(result))
    })

    const setKeyValue = (key, value, ttl) => new Promise((resolve, reject) => {
      return client.set(key, value, ttl, (err) => err ? reject(err) : resolve())
    })

    // arguments -> array for .apply()
    const amtArgs = arguments.length
    let i = -1
    const args = Array(amtArgs)

    while (++i < amtArgs) {
      args[i] = arguments[i]
    }

    // .apply's are needed to support < node-6
    const key = keyProvider.apply(null, args)

    return getByKey(key)
      .then((cacheResult) => {
        if (cacheResult) {
          return cacheResult.item
        }

        return fn.apply(null, args)
          .then((result) => setKeyValue(key, result, ttl)
            .then(() => result))
      })
  }
}
