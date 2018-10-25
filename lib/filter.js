/* global hexo */
'use strict'
var CleanCSS = require('clean-css')
var UglifyJS = require('uglify-js')
var Htmlminifier = require('html-minifier').minify
var Promise = require('bluebird')
var minimatch = require('minimatch')
var zlib = require('zlib')
var br = require('iltorb')

function logicHtml (str, data) {
  var hexo = this

  var options = hexo.config.neat_html
  // Return if disabled.
  if (options.enable === false) return

  var path = data.path
  var exclude = options.exclude
  if (exclude && !Array.isArray(exclude)) exclude = [exclude]

  if (path && exclude && exclude.length) {
    for (var i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], { matchBase: true })) return str
    }
  }

  var result = Htmlminifier(str, options)
  var saved = ((str.length - result.length) / str.length * 100).toFixed(2)
  if (options.logger) {
    var log = hexo.log || console.log
    log.log('Minify the html: %s [%s saved]', path, saved + '%')
  }
  return result
}

function logicCss (str, data) {
  var hexo = this

  var options = hexo.config.neat_css
  // Return if disabled.
  if (options.enable === false) return

  var path = data.path
  var exclude = options.exclude
  if (exclude && !Array.isArray(exclude)) exclude = [exclude]

  if (path && exclude && exclude.length) {
    for (var i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], { matchBase: true })) return str
    }
  }

  return new Promise(function (resolve, reject) {
    new CleanCSS({ level: 2 }).minify(str, function (err, result) {
      if (err) return reject(err)
      var saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2)
      resolve(result.styles)
      if (options.logger) {
        var log = hexo.log || console.log
        log.log('Minify the css: %s [%s saved]', path, saved + '%')
      }
    })
  })
}

function logicJs (str, data) {
  var hexo = this

  var options = hexo.config.neat_js
  // Return if disabled.
  if (options.enable === false) return

  var path = data.path
  var exclude = options.exclude
  if (exclude && !Array.isArray(exclude)) exclude = [exclude]

  if (path && exclude && exclude.length) {
    for (var i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], { matchBase: true })) return str
    }
  }

  // uglifyjs doesn't like unsupported options
  delete options.enable
  delete options.exclude
  var jsLogger = options.logger
  delete options.logger

  var result = UglifyJS.minify(str, options)
  var saved = ((str.length - result.code.length) / str.length * 100).toFixed(2)
  if (jsLogger) {
    var log = hexo.log || console.log
    log.log('Minify the js: %s [%s saved]', path, saved + '%')
  }
  return result.code
}

function logicGzip () {
  var hexo = this

  var options = hexo.config.neat_gzip
  // Return if disabled.
  if (options.enable === false) return

  const route = hexo.route
  const routeList = route.list()

  return Promise.all(routeList.filter(path => (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css'))).map(path => {
    return new Promise((resolve, reject) => {
      // Grab all assets using hexo router
      const assetPath = route.get(path)
      let assetTxt = ''
      // Extract the content
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          // gzip compress using highest level
          zlib.gzip(assetTxt, { level: zlib.Z_BEST_COMPRESSION }, (err, Input) => {
            if (!err) {
              // Save the compressed file to .gz
              route.set(path + '.gz', Input)
              // Logging
              var saved = ((assetTxt.length - Input.toString().length) / assetTxt.length * 100).toFixed(2)
              if (options.logger) {
                var log = hexo.log || console.log
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
  var hexo = this

  var options = hexo.config.neat_brotli
  // Return if disabled.
  if (options.enable === false) return

  const route = hexo.route
  const routeList = route.list()

  return Promise.all(routeList.filter(path => (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css'))).map(path => {
    return new Promise((resolve, reject) => {
      // Grab all assets using hexo router
      const assetPath = route.get(path)
      let assetTxt = ''
      // Extract the content
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          // Input has to be buffer for brotli
          var input = new Buffer.from(assetTxt, 'utf-8')
          // brotli compress using highest level
          br.compress(input, { quality: br.BROTLI_MAX_QUALITY }, (err, output) => {
            if (!err) {
              // Save the compressed file to .br
              route.set(path + '.br', output)
              // Logging
              var saved = ((input.length - output.toString().length) / input.length * 100).toFixed(2)
              if (options.logger) {
                var log = hexo.log || console.log
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
