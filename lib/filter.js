'use strict'

const Htmlminifier = require('html-minifier').minify
const CleanCSS = require('clean-css')
const Terser = require('terser')
const Svgo = require('svgo')
const zlib = require('zlib')
const { promisify } = require('util')
const gzip = promisify(zlib.gzip)
const br = promisify(zlib.brotliCompress)
const micromatch = require('micromatch')

const isMatch = (path = '', patterns = [], options = {}) => {
  if (path && patterns) {
    if (path.length && patterns.length) {
      if (typeof patterns === 'string') patterns = [patterns]
      for (const pattern of patterns) {
        // disable basename if a pattern includes a slash
        let { basename } = options
        // only disable when basename is enabled
        basename = basename && !pattern.includes('/')
        if (micromatch.isMatch(path, pattern, { ...options, basename })) {
          return true
        }
      }
    }
  }
  return false
}

function logFn (original, minified, path, ext) {
  const saved = ((original.length - minified.length) / original.length * 100).toFixed(2)
  const log = this.log || console
  log.log(`${ext}: ${path} [${saved}% saved]`)
}

function minifyHtml (str, data) {
  const hexo = this
  const options = hexo.config.minify.html
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions, verbose } = options

  // Return if a path matches exclusion pattern
  if (isMatch(path, exclude, globOptions)) return str

  const result = Htmlminifier(str, options)
  if (verbose) logFn.call(this, str, result, path, 'html')

  return result
}

async function minifyCss (str, data) {
  const hexo = this
  const options = hexo.config.minify.css
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions, verbose } = options

  if (isMatch(path, exclude, globOptions)) return str

  try {
    const { styles } = await new CleanCSS(options).minify(str)
    if (verbose) logFn.call(this, str, styles, path, 'css')
    return styles
  } catch (err) {
    throw new Error(err)
  }
}

function minifyJs (str, data) {
  const hexo = this
  const options = hexo.config.minify.js
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions, verbose } = options

  if (isMatch(path, exclude, globOptions)) return str

  // Terser doesn't like unsupported options
  const jsOptions = Object.assign({}, options)
  delete jsOptions.enable
  delete jsOptions.priority
  delete jsOptions.verbose
  // Old option, retained to avoid crash when upgrading to v4
  delete jsOptions.logger
  delete jsOptions.exclude
  delete jsOptions.globOptions

  const { code, error } = Terser.minify(str, jsOptions)
  if (error) throw new Error(error)
  if (verbose) logFn.call(this, str, code, path, 'js')

  return code
}

function minifySvg () {
  const hexo = this
  const options = hexo.config.minify.svg
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include, verbose } = options

  let includeString = include || ''
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const { data } = await new Svgo(options).optimize(assetTxt)
            if (verbose) logFn.call(this, assetTxt, data, path, 'svg')
            resolve(route.set(path, data))
          } catch (err) {
            reject(new Error(err))
          }
        }
      })
    })
  }))
}

function gzipFn () {
  const hexo = this
  const options = hexo.config.minify.gzip
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include, verbose } = options
  let { level } = options
  if (typeof level !== 'number') level = zlib.constants.Z_BEST_COMPRESSION

  let includeString = include || ''
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const result = await gzip(assetTxt, { level })
            if (verbose) logFn.call(this, assetTxt, result, path, 'gzip')
            resolve(route.set(path + '.gz', result))
          } catch (err) {
            reject(new Error(err))
          }
        }
      })
    })
  }))
}

function brotliFn () {
  const hexo = this
  const options = hexo.config.minify.brotli
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include, verbose } = options
  let { level } = options
  if (typeof level !== 'number') level = zlib.constants.BROTLI_MAX_QUALITY

  let includeString = include || ''
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', async () => {
        if (assetTxt.length) {
          try {
            const result = await br(assetTxt, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level } })
            if (verbose) logFn.call(this, assetTxt, result, path, 'brotli')
            resolve(route.set(path + '.br', result))
          } catch (err) {
            reject(new Error(err))
          }
        }
      })
    })
  }))
}

module.exports = {
  minifyHtml,
  minifyCss,
  minifyJs,
  minifySvg,
  gzipFn,
  brotliFn
}
