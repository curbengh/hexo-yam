'use strict'
const zlib = require('zlib')
const { promisify } = require('util')
const gzip = promisify(zlib.gzip)
const br = promisify(zlib.brotliCompress)
const { match, logFn } = require('./tools')

function gzipFn() {
  const hexo = this
  const options = hexo.config.minify.gzip

  const route = hexo.route
  /** @type {string} */
  const routeList = route.list()
  const { globOptions, include, verbose } = options
  let level = options.level
  if (typeof level !== 'number') level = zlib.constants.Z_BEST_COMPRESSION

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const result = await gzip(assetTxt, { level })
            if (verbose) logFn.call(this, assetTxt, result, path, 'gzip')
            resolve(route.set(path + '.gz', result))
            return
          } catch (err) {
            reject(new Error(`Path: ${path}\n${err}`))
          }
        }
        resolve()
      })
    })
  }))
}

function brotliFn() {
  const hexo = this
  const options = hexo.config.minify.brotli

  const route = hexo.route
  const routeList = route.list()
  const { globOptions, include, verbose } = options
  let level = options.level
  if (typeof level !== 'number') level = zlib.constants.BROTLI_MAX_QUALITY

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const result = await br(assetTxt, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level } })
            if (verbose) logFn.call(this, assetTxt, result, path, 'brotli')
            route.set(path + '.br', result)
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
  gzipFn,
  brotliFn
}