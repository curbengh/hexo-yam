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

const match = (paths = [], patterns = [], options = {}) => {
  let input = paths
  if (paths && patterns) {
    if (paths.length && patterns.length) {
      const output = []
      if (typeof patterns === 'string') patterns = [patterns]
      const exclude = patterns.filter((pattern) => pattern.startsWith('!'))
      const include = patterns.filter((pattern) => !pattern.startsWith('!'))
      if (exclude.length) input = micromatch(paths, exclude, options)
      if (include.length) {
        for (const pattern of include) {
          let { basename } = options
          basename = basename && !pattern.includes('/')
          const tmp = micromatch(input, pattern, { ...options, basename })
          if (tmp.length) output.push(...tmp)
        }
        return [...new Set(output)]
      }
      return input
    }
  }
  return paths
}

function logFn (original, minified, path, ext) {
  const saved = ((original.length - minified.length) / original.length * 100).toFixed(2)
  const log = this.log || console
  log.log(`${ext}: ${path} [${saved}% saved]`)
}

function minifyHtml (str, data) {
  const hexo = this
  const options = hexo.config.minify.html
  if (options.enable === false || !str) return

  const { path } = data
  const { exclude, globOptions, verbose } = options

  // Return if a path matches exclusion pattern
  if (isMatch(path, exclude, globOptions)) return str

  try {
    const result = Htmlminifier(str, options)
    if (verbose) logFn.call(this, str, result, path, 'html')

    return result
  } catch (err) {
    throw new Error(err)
  }
}

async function minifyCss (str, data) {
  const hexo = this
  const options = hexo.config.minify.css
  if (options.enable === false || !str) return

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
  if (options.enable === false || !str) return

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

  return Promise.all((match(routeList, include, globOptions)).map((path) => {
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
        resolve()
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

  return Promise.all((match(routeList, include, globOptions)).map((path) => {
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
        resolve()
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

  return Promise.all((match(routeList, include, globOptions)).map((path) => {
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
        resolve()
      })
    })
  }))
}

function minifyXml () {
  const hexo = this
  const options = hexo.config.minify.xml
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include, removeComments, verbose } = options

  return Promise.all((match(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          try {
            /* !
            * Regex patterns are adapted from pretty-data 0.50.0
            * Licensed MIT (c) 2012-2017 Vadim Kiryukhin ( vkiryukhin @ gmail.com )
            * https://github.com/vkiryukhin/pretty-data
            */
            const text = removeComments
              ? assetTxt.replace(/<![ \r\n\t]*(--([^-]|[\r\n]|-[^-])*--[ \r\n\t]*)>/g, '')
              : assetTxt
            const result = text.replace(/>\s{0,}</g, '><')
            if (verbose) logFn.call(this, assetTxt, result, path, 'xml')
            resolve(route.set(path, result))
          } catch (err) {
            reject(new Error(err))
          }
        }
        resolve()
      })
    })
  }))
}

function minifyJson () {
  const hexo = this
  const options = hexo.config.minify.json
  if (options.enable === false) return

  const { route } = hexo
  const routeList = route.list()
  const { globOptions, include, verbose } = options

  return Promise.all((match(routeList, include, globOptions)).map((path) => {
    return new Promise((resolve, reject) => {
      const assetPath = route.get(path)
      let assetTxt = ''
      assetPath.on('data', (chunk) => (assetTxt += chunk))
      assetPath.on('end', () => {
        if (assetTxt.length) {
          try {
            const result = JSON.stringify(JSON.parse(assetTxt))
            if (verbose) logFn.call(this, assetTxt, result, path, 'json')
            resolve(route.set(path, result))
          } catch (err) {
            reject(new Error(err))
          }
        }
        resolve()
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
  brotliFn,
  minifyXml,
  minifyJson
}
