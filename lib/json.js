'use strict'
const { match, logFn } = require('./tools')

/**
 * @this {import('@types/hexo')}
 */
function minifyJson() {
  const hexo = this
  const options = hexo.config.minify.json

  const route = hexo.route
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose } = options

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          try {
            const result = JSON.stringify(JSON.parse(assetTxt))
            if (verbose) logFn.call(this, assetTxt, result, path, 'json')
            route.set(path, result)
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
  minifyJson
}