'use strict'
const CleanCSS = require('clean-css')
const { isMatch, logFn } = require('./tools')

/**
 * @param {string} str
 * @param {{ path: string }} data
 */
async function minifyCss(str, data) {
  const hexo = this
  const options = hexo.config.minify.css
  if (!str) return str

  const { path } = data
  const { exclude, globOptions, verbose } = options

  if (isMatch(path, exclude, globOptions)) return str

  try {
    const { styles } = await new CleanCSS(options).minify(str)
    if (verbose) logFn.call(this, str, styles, path, 'css')
    return styles
  } catch (err) {
    throw new Error(`Path: ${path}\n${err}`)
  }
}

module.exports = {
  minifyCss
}