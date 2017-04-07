'use strict'

// using function() to get arguments (to support < node-6) else I'd use spread :)
module.exports = (options) => function () {
  const client = options.client
  const fn = options.fn
  const keyProvider = options.keyProvider
  const ttl = options.ttl

  // arguments -> array for .apply()
  const amtArgs = arguments.length

  if (amtArgs === 0) {
    throw new Error('Function should at least have a callback')
  }

  let i = -1
  const args = Array(amtArgs)

  while (++i < amtArgs) {
    args[i] = arguments[i]
  }

  // last arg is the callback - by convention etc
  const originalCallback = args.pop()

  if (typeof originalCallback !== 'function') {
    throw new Error(`Function should have a callback as it's last argument`)
  }

  // .apply's are needed to support < node-6
  const key = keyProvider.apply(null, args)

  const callFnCacheResult = () => {
    const wrappedCallback = (err, result) => {
      if (err) {
        return originalCallback(err)
      }
      return client.set(key, result, ttl, (err) => err ? originalCallback(err) : originalCallback(null, result))
    }
    fn.apply(null, args.concat(wrappedCallback))
  }

  return client.get(key, (err, result) => {
    if (err) {
      return originalCallback(err)
    }
    if (result) {
      return originalCallback(null, result.item)
    }

    return callFnCacheResult()
  })
}
