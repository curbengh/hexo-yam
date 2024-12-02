'use strict'
const { match, logFn } = require('./tools')

function minifyJson() {
  const hexo = this
  const options = hexo.config.minify.json

  const { route } = hexo
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose } = options

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: string) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          try {
            const result = JSON.stringify(JSON.parse(assetTxt))
            if (verbose) logFn.call(this, assetTxt, result, path, 'json')
            resolve(route.set(path, result))
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
  minifyJson
}