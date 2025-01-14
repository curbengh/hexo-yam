'use strict'
const { match, logFn } = require('./tools')

/**
 * @this {import('@types/hexo')}
 */
async function minifyXml() {
  const { minify: compressXml } = await import('minify-xml')

  const hexo = this
  const options = hexo.config.minify.xml

  const route = hexo.route
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose } = options

  await Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          try {
            const result = compressXml(assetTxt, { ...options })
            if (verbose) logFn.call(this, assetTxt, result, path, 'xml')
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
  minifyXml
}