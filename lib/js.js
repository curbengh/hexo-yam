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

  const path = data.path
  const { exclude, globOptions, verbose, ...jsOptions } = options

  if (isMatch(path, exclude, globOptions)) return str

  // Terser doesn't like unsupported options
  delete jsOptions.enable
  delete jsOptions.priority
  // Old option, retained to avoid crash when upgrading to v4
  delete jsOptions.logger

  try {
    const code = await terserMinify(str, jsOptions).code
    if (verbose) logFn.call(this, str, code, path, 'js')
    return code
  } catch (err) {
    throw new Error(`Path: ${path}\n${err}`)
  }
}

module.exports = {
  minifyJs
}