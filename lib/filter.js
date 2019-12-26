'use strict'

const Htmlminifier = require('html-minifier').minify
const CleanCSS = require('clean-css')
const Terser = require('terser')
const Svgo = require('svgo')
const zlib = require('zlib')
const { promisify } = require('util')
const gzip = promisify(zlib.gzip)
const br = require('zlib').brotliCompress ? promisify(require('zlib').brotliCompress) : require('iltorb').compress
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

function verbose (original, minified, path, ext) {
  const saved = ((original.length - minified.length) / original.length * 100).toFixed(2)
  const log = this.log || console
  log.log(`${ext}: ${path} [${saved}% saved]`)
}

function minifyHtml (str, data) {
  const hexo = this
  const options = hexo.config.minify.html
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions } = options

  // Return if a path matches exclusion pattern
  if (isMatch(path, exclude, globOptions)) return str

  const result = Htmlminifier(str, options)
  if (options.logger) verbose.call(this, str, result, path, 'html')

  return result
}

async function minifyCss (str, data) {
  const hexo = this
  const options = hexo.config.minify.css
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions } = options

  if (isMatch(path, exclude, globOptions)) return str

  try {
    const { styles } = await new CleanCSS(options).minify(str)
    if (options.logger) verbose.call(this, str, styles, path, 'css')
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
  const { exclude, globOptions } = options

  if (isMatch(path, exclude, globOptions)) return str

  // Terser doesn't like unsupported options
  const jsOptions = Object.assign({}, options)
  delete jsOptions.enable
  delete jsOptions.priority
  delete jsOptions.logger
  delete jsOptions.exclude
  delete jsOptions.globOptions

  const { code, error } = Terser.minify(str, jsOptions)
  if (error) throw new Error(error)
  if (options.logger) verbose.call(this, str, code, path, 'js')

  return code
}

function minifySvg () {
  const hexo = this
  const options = hexo.config.minify.svg
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include } = options

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
            const result = await new Svgo(options).optimize(assetTxt)
            if (options.logger) verbose.call(this, assetTxt.join().toString(), result.data, path, 'svg')
            resolve(route.set(path, result.data))
          } catch (err) {
            reject(err)
            throw new Error(err)
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
  const { globOptions, include } = options

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
            // TODO: Drop Buffer
            const input = Buffer.from(assetTxt, 'utf-8')
            const result = await gzip(input, { level: zlib.constants.Z_BEST_COMPRESSION })
            if (options.logger) verbose.call(this, input, result.toString(), path, 'gzip')
            resolve(route.set(path + '.gz', result))
          } catch (err) {
            reject(err)
            throw new Error(err)
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
  const { globOptions, include } = options

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
            const input = Buffer.from(assetTxt, 'utf-8')
            const result = await br(input)
            if (options.logger) verbose.call(this, input, result.toString(), path, 'brotli')
            resolve(route.set(path + '.br', result))
          } catch (err) {
            reject(err)
            throw new Error(err)
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
