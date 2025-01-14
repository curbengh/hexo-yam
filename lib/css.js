'use strict'
const CleanCSS = require('clean-css')
const { isMatch, match, logFn } = require('./tools')

/**
 * @param {string} str
 * @param {{ path: string }} data
 * @this {import('@types/hexo')}
 */
async function minifyCss(str, data) {
  const hexo = this
  const options = hexo.config.minify.css
  if (!str) return str

  const path = data.path
  const { exclude, globOptions, verbose } = options

  if (isMatch(path, exclude, globOptions)) return str

  try {
    const styles = await new CleanCSS(options).minify(str).styles
    if (verbose) logFn.call(this, str, styles, path, 'css')
    return styles
  } catch (err) {
    throw new Error(`Path: ${path}\n${err}`)
  }
}

/**
 * @this {import('@types/hexo')}
 */
function minifyCssWithMap() {
  const hexo = this
  const options = hexo.config.minify.css
  const { parse } = require('path')

  const route = hexo.route
  const routeList = route.list()
  /** @type {{ exclude: string[] }} */
  const { exclude, globOptions, verbose } = options
  const include = ['*.css', ...exclude.map(x => `!${x}`)]
  const cleanCSS = new CleanCSS(options)

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: void) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const { base, ext, name } = parse(path)
            const { styles, sourceMap } = await cleanCSS.minify(assetTxt)
            if (verbose) logFn.call(this, assetTxt, result, path, 'css')
            route.set(path, `${styles}\n/*# sourceMappingURL=${base}.map */`)
            const map = sourceMap.toJSON()
            map.sources = [`${name}.source${ext}`]
            if (options.mapIncludeSources === true) {
              map.sourcesContent = [assetTxt]
            }
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
  minifyCss,
  minifyCssWithMap
}