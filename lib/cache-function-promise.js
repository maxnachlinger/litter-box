'use strict'

module.exports = (client) => {
  // promisify a few methods to make the code below simpler
  const getKey = (key) => new Promise((resolve, reject) => {
    return client.get(key, (err, result) => err ? reject(err) : resolve(result))
  })

  const setKey = (key, value, ttl) => new Promise((resolve, reject) => {
    return client.set(key, value, ttl, (err) => err ? reject(err) : resolve())
  })

  // using function() to get arguments (to support < node-6) else I'd use spread :)
  return (options) => function () {
    const fn = options.fn
    const keyProvider = options.keyProvider
    const ttl = options.ttl

    // arguments -> array for .apply()
    const amtArgs = arguments.length
    let i = -1
    const args = Array(amtArgs)

    while (++i < amtArgs) {
      args[i] = arguments[i]
    }

    const key = keyProvider(...args)

    return getKey(key)
      .then((cacheResult) => {
        if (cacheResult) {
          return cacheResult.item
        }

        return fn(...args)
          .then((result) => {
            return setKey(key, result, ttl)
              .then(() => result)
          })
      })
  }
}
