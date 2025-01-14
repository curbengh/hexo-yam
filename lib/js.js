'use strict'
const { minify: terserMinify } = require('terser')
const { isMatch, match, logFn } = require('./tools')

/**
 * @param {string} str
 * @param {{ path: string }} data
 * @this {import('@types/hexo')}
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

/**
 * @this {import('@types/hexo')}
 */
function minifyJsWithMap() {
  const hexo = this
  const options = hexo.config.minify.js
  const { parse } = require('path')

  const route = hexo.route
  const routeList = route.list()
  /** @type {{ exclude: string[] }} */
  const { exclude, globOptions, verbose, ...jsOptions } = options
  const include = ['*.js', ...exclude.map(x => `!${x}`)]

  // Terser doesn't like unsupported options
  delete jsOptions.enable
  delete jsOptions.priority
  // Old option, retained to avoid crash when upgrading to v4
  delete jsOptions.logger

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const { base, ext, name } = parse(path)
            jsOptions.sourceMap = {
              ...jsOptions.sourceMap,
              filename: base,
              asObject: true,
              url: `${base}.map`
            }
            const { code, map } = await terserMinify(assetTxt, { ...jsOptions })
            if (verbose) logFn.call(this, assetTxt, result, path, 'js')
            route.set(path, code)
            map.sources = [`${name}.source${ext}`]
            route.set(`${path}.map`, JSON.stringify(map))
          } catch (err) {
            reject(new Error(`Path: ${path}\n${err}`))
          }
        }
        resolve()
      })
    })
  }))
}

module.exports = {
  minifyJs,
  minifyJsWithMap
}