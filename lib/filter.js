'use strict'

const Htmlminifier = require('html-minifier').minify
const CleanCSS = require('clean-css')
const Terser = require('terser')
const Svgo = require('svgo')
const zlib = require('zlib')
const br = require('iltorb')
const micromatch = require('micromatch')

function isMatch (path, patterns, options) {
  if (path && patterns && patterns.length) {
    return micromatch.isMatch(path, patterns, options)
  } else {
    return false
  }
}

function logicHtml (str, data) {
  const hexo = this
  const options = hexo.config.neat_html
  // Return if disabled.
  if (options.enable === false) return

  const path = data.path
  const exclude = options.exclude
  const globOptions = options.globOptions

  let excludeString = exclude
  if (Array.isArray(exclude)) excludeString = exclude.join('')
  if (excludeString.includes('/')) globOptions.basename = false

  // Return if a path matches exclusion pattern
  if (isMatch(path, exclude, globOptions)) return str

  const result = Htmlminifier(str, options)
  const saved = ((str.length - result.length) / str.length * 100).toFixed(2)
  if (options.logger) {
    const log = hexo.log || console.log
    log.log('Minify the html: %s [%s saved]', path, saved + '%')
  }
  return result
}

function logicCss (str, data) {
  const hexo = this
  const options = hexo.config.neat_css
  if (options.enable === false) return

  const path = data.path
  const exclude = options.exclude
  const globOptions = options.globOptions

  let excludeString = exclude
  if (exclude && Array.isArray(exclude)) excludeString = exclude.join('')
  if (excludeString && excludeString.includes('/')) globOptions.basename = false

  if (isMatch(path, exclude, globOptions)) return str

  return new Promise((resolve, reject) => {
    new CleanCSS(options).minify(str, (err, result) => {
      if (err) return reject(err)
      const saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2)
      resolve(result.styles)
      if (options.logger) {
        const log = hexo.log || console.log
        log.log('Minify the css: %s [%s saved]', path, saved + '%')
      }
    })
  })
}

function logicJs (str, data) {
  const hexo = this
  const options = hexo.config.neat_js
  if (options.enable === false) return

  const path = data.path
  const exclude = options.exclude
  const globOptions = options.globOptions

  let excludeString = exclude
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
  const saved = ((str.length - result.code.length) / str.length * 100).toFixed(2)
  if (options.logger) {
    const log = hexo.log || console.log
    log.log('Minify the js: %s [%s saved]', path, saved + '%')
  }
  return result.code
}

function logicSvg () {
  const hexo = this
  const options = hexo.config.neat_svg
  // Return if disabled.
  if (options.enable === false) return

  const route = hexo.route
  const routeList = route.list()
  const include = options.include
  const globOptions = options.globOptions

  let includeString = include
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map(path => {
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
            // Logging
            const saved = ((assetTxt.length - result.data.length) / assetTxt.length * 100).toFixed(2)
            if (options.logger) {
              const log = hexo.log || console.log
              log.log('Minify the svg: %s [%s saved]', path, saved + '%')
            }
            resolve(assetTxt)
          })
        }
      })
    })
  }))
}

function logicGzip () {
  const hexo = this
  const options = hexo.config.neat_gzip
  // Return if disabled.
  if (options.enable === false) return

  const route = hexo.route
  const routeList = route.list()
  const include = options.include
  const globOptions = options.globOptions

  let includeString = include
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map(path => {
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
              // Logging
              const saved = ((assetTxt.length - Input.toString().length) / assetTxt.length * 100).toFixed(2)
              if (options.logger) {
                const log = hexo.log || console.log
                log.log('Gzip-compressed %s [%s saved]', path, saved + '%')
              }
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

function logicBrotli () {
  const hexo = this
  const options = hexo.config.neat_brotli
  // Return if disabled.
  if (options.enable === false) return

  const route = hexo.route
  const routeList = route.list()
  const include = options.include
  const globOptions = options.globOptions

  let includeString = include
  if (include && Array.isArray(include)) includeString = include.join('')
  if (includeString && includeString.includes('/')) globOptions.basename = false

  return Promise.all((micromatch(routeList, include, globOptions)).map(path => {
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
              // Logging
              const saved = ((input.length - output.toString().length) / input.length * 100).toFixed(2)
              if (options.logger) {
                const log = hexo.log || console.log
                log.log('Brotli-compressed %s [%s saved]', path, saved + '%')
              }
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
  logicHtml: logicHtml,
  logicCss: logicCss,
  logicJs: logicJs,
  logicSvg: logicSvg,
  logicGzip: logicGzip,
  logicBrotli: logicBrotli
}
