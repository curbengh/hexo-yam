'use strict'

const Htmlminifier = require('html-minifier').minify
const CleanCSS = require('clean-css')
const Terser = require('terser')
const Svgo = require('svgo')
const zlib = require('zlib')
const br = require('iltorb')
const micromatch = require('micromatch')

const isMatch = (path, patterns, options) => {
  if (path && patterns && patterns.length) {
    return micromatch.isMatch(path, patterns, options)
  } else {
    return false
  }
}

function verbose (original, minified, path, ext) {
  const saved = ((original.length - minified.length) / original.length * 100).toFixed(2)
  const log = this.log || console
  log.log(`${ext}: ${path} [${saved}% saved]`)
}

function minifyHtml (str, data) {
  const hexo = this
  const options = hexo.config.minify.html
  // Return if disabled.
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions } = options

  let excludeString = exclude || ''
  if (Array.isArray(exclude)) excludeString = exclude.join('')
  if (excludeString.includes('/')) globOptions.basename = false

  // Return if a path matches exclusion pattern
  if (isMatch(path, exclude, globOptions)) return str

  const result = Htmlminifier(str, options)
  if (options.logger) verbose.call(this, str, result, path, 'html')

  return result
}

function minifyCss (str, data) {
  const hexo = this
  const options = hexo.config.minify.css
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions } = options

  let excludeString = exclude || ''
  if (exclude && Array.isArray(exclude)) excludeString = exclude.join('')
  if (excludeString && excludeString.includes('/')) globOptions.basename = false

  if (isMatch(path, exclude, globOptions)) return str

  return new Promise((resolve, reject) => {
    new CleanCSS(options).minify(str, (err, result) => {
      if (err) return reject(err)
      if (options.logger) verbose.call(this, str, result.styles, path, 'css')
      resolve(result.styles)
    })
  })
}

function minifyJs (str, data) {
  const hexo = this
  const options = hexo.config.minify.js
  if (options.enable === false) return

  const { path } = data
  const { exclude, globOptions } = options

  let excludeString = exclude || ''
  if (exclude && Array.isArray(exclude)) excludeString = exclude.join('')
  if (excludeString && excludeString.includes('/')) globOptions.basename = false

  if (isMatch(path, exclude, globOptions)) return str

  // Terser doesn't like unsupported options
  const jsOptions = Object.assign({}, options)
  delete jsOptions.enable
  delete jsOptions.exclude
  delete jsOptions.logger
  delete jsOptions.globOptions

  const result = Terser.minify(str, jsOptions)
  if (options.logger) verbose.call(this, str, result.code, path, 'js')

  return result.code
}

function minifySvg () {
  const hexo = this
  const options = hexo.config.minify.svg
  // Return if disabled.
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include } = options

  let includeString = include || ''
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      // Grab all assets using hexo router
      const assetPath = route.get(path)
      let assetTxt = ''
      // Extract the content
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          // Minify using svgo
          new Svgo(options).optimize(assetTxt).then((result) => {
            // Replace the original file with the minified.
            route.set(path, result.data)

            if (options.logger) verbose.call(this, assetTxt, result.data, path, 'svg')

            resolve(assetTxt)
          })
        }
      })
    })
  }))
}

function gzipFn () {
  const hexo = this
  const options = hexo.config.minify.gzip
  // Return if disabled.
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include } = options

  let includeString = include || ''
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      // Grab all assets using hexo router
      const assetPath = route.get(path)
      let assetTxt = ''
      // Extract the content
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          // gzip compress using highest level
          zlib.gzip(assetTxt, { level: zlib.constants.Z_BEST_COMPRESSION }, (err, Input) => {
            if (!err) {
              // Save the compressed file to .gz
              route.set(path + '.gz', Input)

              if (options.logger) verbose.call(this, assetTxt, Input.toString(), path, 'gzip')

              resolve(assetTxt)
            } else {
              reject(err)
            }
          })
        }
      })
    })
  }))
}

function brotliFn () {
  const hexo = this
  const options = hexo.config.minify.brotli
  // Return if disabled.
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include } = options

  let includeString = include || ''
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      // Grab all assets using hexo router
      const assetPath = route.get(path)
      let assetTxt = ''
      // Extract the content
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          // Input has to be buffer for brotli
          const input = Buffer.from(assetTxt, 'utf-8')
          // brotli defaults to max compression level
          br.compress(input, (err, output) => {
            if (!err) {
              // Save the compressed file to .br
              route.set(path + '.br', output)

              if (options.logger) verbose.call(this, input, output.toString(), path, 'brotli')

              resolve(assetTxt)
            } else {
              reject(err)
            }
          })
        }
      })
    })
  }))
}

module.exports = {
  minifyHtml: minifyHtml,
  minifyCss: minifyCss,
  minifyJs: minifyJs,
  minifySvg: minifySvg,
  gzipFn: gzipFn,
  brotliFn: brotliFn
}
