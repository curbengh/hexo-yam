/* global hexo */
'use strict'
const CleanCSS = require('clean-css')
const Terser = require('terser')
const Htmlminifier = require('html-minifier').minify
const minimatch = require('minimatch')
const zlib = require('zlib')
const br = require('iltorb')

function logicHtml (str, data) {
  const hexo = this
  const options = hexo.config.neat_html
  // Return if disabled.
  if (options.enable === false) return

  let path = data.path
  let exclude = options.exclude
  if (exclude && !Array.isArray(exclude)) exclude = [exclude]

  if (path && exclude && exclude.length) {
    for (let i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], { matchBase: true })) return str
    }
  }

  let result = Htmlminifier(str, options)
  let saved = ((str.length - result.length) / str.length * 100).toFixed(2)
  if (options.logger) {
    let log = hexo.log || console.log
    log.log('Minify the html: %s [%s saved]', path, saved + '%')
  }
  return result
}

function logicCss (str, data) {
  const hexo = this
  const options = hexo.config.neat_css
  // Return if disabled.
  if (options.enable === false) return

  let path = data.path
  let exclude = options.exclude
  if (exclude && !Array.isArray(exclude)) exclude = [exclude]

  if (path && exclude && exclude.length) {
    for (let i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], { matchBase: true })) return str
    }
  }

  return new Promise(function (resolve, reject) {
    new CleanCSS({ level: 2 }).minify(str, function (err, result) {
      if (err) return reject(err)
      let saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2)
      resolve(result.styles)
      if (options.logger) {
        let log = hexo.log || console.log
        log.log('Minify the css: %s [%s saved]', path, saved + '%')
      }
    })
  })
}

function logicJs (str, data) {
  const hexo = this
  const options = hexo.config.neat_js
  // Return if disabled.
  if (options.enable === false) return

  let path = data.path
  let exclude = options.exclude
  if (exclude && !Array.isArray(exclude)) exclude = [exclude]

  if (path && exclude && exclude.length) {
    for (let i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], { matchBase: true })) return str
    }
  }

  // Terser doesn't like unsupported options
  delete options.enable
  delete options.exclude
  let jsLogger = options.logger
  delete options.logger

  let result = Terser.minify(str, options)
  let saved = ((str.length - result.code.length) / str.length * 100).toFixed(2)
  if (jsLogger) {
    let log = hexo.log || console.log
    log.log('Minify the js: %s [%s saved]', path, saved + '%')
  }
  return result.code
}

function logicGzip () {
  const hexo = this
  const options = hexo.config.neat_gzip
  // Return if disabled.
  if (options.enable === false) return

  let route = hexo.route
  let routeList = route.list()

  return Promise.all(routeList.filter(path => (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')
																							|| path.endsWith('.xml') || path.endsWith('.json') || path.endsWith('.txt')
																							|| path.endsWith('.ttf') || path.endsWith('.atom') || path.endsWith('.stl')
																							|| path.endsWith('.svg') || path.endsWith('.eot'))).map(path => {
    return new Promise((resolve, reject) => {
      // Grab all assets using hexo router
      let assetPath = route.get(path)
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
              let saved = ((assetTxt.length - Input.toString().length) / assetTxt.length * 100).toFixed(2)
              if (options.logger) {
                let log = hexo.log || console.log
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

  let route = hexo.route
  let routeList = route.list()

  return Promise.all(routeList.filter(path => (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')
																							|| path.endsWith('.xml') || path.endsWith('.json') || path.endsWith('.txt')
																							|| path.endsWith('.ttf') || path.endsWith('.atom') || path.endsWith('.stl')
																							|| path.endsWith('.svg') || path.endsWith('.eot'))).map(path => {
    return new Promise((resolve, reject) => {
      // Grab all assets using hexo router
      let assetPath = route.get(path)
      let assetTxt = ''
      // Extract the content
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          // Input has to be buffer for brotli
          let input = new Buffer.from(assetTxt, 'utf-8')
          // brotli defaults to max compression level
          br.compress(input, (err, output) => {
            if (!err) {
              // Save the compressed file to .br
              route.set(path + '.br', output)
              // Logging
              let saved = ((input.length - output.toString().length) / input.length * 100).toFixed(2)
              if (options.logger) {
                let log = hexo.log || console.log
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
  logicGzip: logicGzip,
  logicBrotli: logicBrotli
}
