'use strict'
const { compress: zstd } = require('@mongodb-js/zstd')
const { match, logFn } = require('./tools')

function zstdFn() {
  const hexo = this
  const options = hexo.config.minify.zstd

  const route = hexo.route
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose, ensureCompressed } = options
  let level = options.level
  if (typeof level !== 'number') level = undefined

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const input = Buffer.from(assetTxt, 'utf-8')
            const result = await zstd(input, level)
            if (verbose) logFn.call(this, input, result, path, 'zstd')
            if (!ensureCompressed || input.length > result.length) {
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
  zstdFn
}