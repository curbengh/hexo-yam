'use strict'
const { minify: terserMinify } = require('terser')
const { isMatch, logFn } = require('./tools')

/**
 * @param {string} str
 * @param {{ path: string }} data
 */
async function minifyJs(str, data) {
  const hexo = this
  const options = hexo.config.minify.js
  if (!str) return str

  const { path } = data
  const { exclude, globOptions, verbose } = options

  if (isMatch(path, exclude, globOptions)) return str

  // Terser doesn't like unsupported options
  const jsOptions = { ...options }
  delete jsOptions.enable
  delete jsOptions.priority
  delete jsOptions.verbose
  // Old option, retained to avoid crash when upgrading to v4
  delete jsOptions.logger
  delete jsOptions.exclude
  delete jsOptions.globOptions

  try {
    const { code } = await terserMinify(str, jsOptions)
    if (verbose) logFn.call(this, str, code, path, 'js')
    return code
  } catch (err) {
    throw new Error(`Path: ${path}\n${err}`)
  }
}

module.exports = {
  minifyJs
}