'use strict'

module.exports = (options) => {
  const errors = []

  if (!options.fn) {
    errors.push('fn required')
  }

  if (typeof options.fn !== 'function') {
    errors.push('fn argument should be a function')
  }

  if (!options.client || !options.client.get) {
    errors.push('catbox cache client required')
  }

  if (!options.keyProvider) {
    errors.push('keyProvider required')
  }

  if (typeof options.keyProvider !== 'function') {
    errors.push('keyProvider argument should be a function')
  }

  if (!options.ttl) {
    errors.push('ttl required')
  }

  if (typeof options.ttl !== 'number') {
    errors.push('ttl argument should be an integer')
  }

  if (options.ttl % 1 !== 0) {
    errors.push('ttl argument should be an integer')
  }

  if (errors.length) {
    throw new Error(errors.join(', '))
  }

  return options
}
