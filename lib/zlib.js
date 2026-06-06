/* eslint-disable space-before-function-paren */
'use strict'
const zlib = require('zlib')
const { promisify } = require('util')
const gzip = promisify(zlib.gzip)
const br = promisify(zlib.brotliCompress)
const zstd = promisify(zlib.zstdCompress)
const { match, logFn } = require('./tools')

/**
 * @this {import('hexo')}
 */
function gzipFn() {
  const hexo = this
  const options = hexo.config.minify.gzip

  const route = hexo.route
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose, ensureCompressed } = options
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
            const buffer = Buffer.from(assetTxt)
            if (verbose) logFn.call(this, buffer, result, path, 'gzip')
            if (!ensureCompressed || buffer.length > result.length) {
              route.set(path + '.gz', result)
            }
          } catch (err) {
            reject(new Error(`Path: ${path}\n${err}`))
          }
        }
        resolve()
      })
    })
  }))
}

/**
 * @this {import('hexo')}
 */
function brotliFn() {
  const hexo = this
  const options = hexo.config.minify.brotli

  const route = hexo.route
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose, ensureCompressed } = options
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
            const buffer = Buffer.from(assetTxt)
            if (verbose) logFn.call(this, buffer, result, path, 'brotli')
            if (!ensureCompressed || buffer.length > result.length) {
              route.set(path + '.br', result)
            }
          } catch (err) {
            reject(new Error(`Path: ${path}\n${err}`))
          }
        }
        resolve()
      })
    })
  }))
}

/**
 * @this {import('hexo')}
 */
function zstdFn() {
  const hexo = this
  const options = hexo.config.minify.zstd

  const route = hexo.route
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose, ensureCompressed } = options
  let level = options.level
  if (typeof level !== 'number') level = zlib.constants.ZSTD_CLEVEL_DEFAULT

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const result = await zstd(assetTxt, { params: { [zlib.constants.ZSTD_c_compressionLevel]: level } })
            const buffer = Buffer.from(assetTxt)
            if (verbose) logFn.call(this, buffer, result, path, 'zstd')
            if (!ensureCompressed || buffer.length > result.length) {
              route.set(path + '.zst', result)
            }
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
  brotliFn,
  zstdFn
}
