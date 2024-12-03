'use strict'
const { minify: htmlMinify } = require('html-minifier-terser')
const { isMatch, logFn } = require('./tools')

/**
 * @param {string} str
 * @param {{ path: string }} data
 */
async function minifyHtml(str, data) {
  const hexo = this
  const options = hexo.config.minify.html
  if (!str) return str

  const path = data.path
  const { exclude, globOptions, verbose } = options

  // Return if a path matches exclusion pattern
  if (isMatch(path, exclude, globOptions)) return str

  try {
    const result = await htmlMinify(str, options)
    if (verbose) logFn.call(this, str, result, path, 'html')
    return result
  } catch (err) {
    throw new Error(`Path: ${path}\n${err}`)
  }
}

module.exports = {
  minifyHtml
}