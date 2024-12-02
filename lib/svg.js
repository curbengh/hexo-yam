'use strict'
const { optimize: svgOptimize } = require('svgo')
const { match, logFn } = require('./tools')

function minifySvg() {
  const hexo = this
  const options = hexo.config.minify.svg

  const { route } = hexo
  /** @type {string[]} */
  const routeList = route.list()
  const { globOptions, include, verbose } = options
  // const plugins = Array.isArray(options.plugins) ? extendDefaultPlugins(options.plugins) : extendDefaultPlugins([])
  const pluginCfg = Object.prototype.toString.call(options.plugins) === '[object Object]' ? { ...options.plugins } : {}
  const plugins = [{
    name: 'preset-default',
    params: {
      overrides: pluginCfg
    }
  }]

  return Promise.all((match(routeList, include, globOptions)).map(path => {
    return new Promise((/** @type {(value: string) => void} */ resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', chunk => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const { data } = svgOptimize(assetTxt, { ...options, plugins })
            if (verbose) logFn.call(this, assetTxt, data, path, 'svg')
            resolve(route.set(path, data))
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
  minifySvg
}