'use strict'
const { compress: zstd } = require('@mongodb-js/zstd')
const { match, logFn } = require('./tools')

function zstdFn() {
  const hexo = this
  const options = hexo.config.minify.zstd

  const route = hexo.route
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose } = options
  let level = options.level
  if (typeof level !== 'number') level = undefined

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: string) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const input = Buffer.from(assetTxt, 'utf-8')
            const result = await zstd(input, level)
            if (verbose) logFn.call(this, assetTxt, result, path, 'zstd')
            resolve(route.set(path + '.zst', result))
          } catch (err) {
            reject(new Error(`Path: ${path}\n${err}`))
          }
        }
        resolve(assetTxt)
      })
    })
  }))
}

module.exports = {
  zstdFn
}