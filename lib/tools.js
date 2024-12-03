'use strict'
const micromatch = require('micromatch')

/**
 * @param {string | string[]} patterns
 * @param {{ basename: string }} options
 */
function isMatch(path = '', patterns = [], options = {}) {
  if (path && patterns) {
    if (path.length && patterns.length) {
      if (typeof patterns === 'string') patterns = [patterns]
      for (const pattern of patterns) {
        // disable basename if a pattern includes a slash
        let basename = options.basename
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

/**
 * @param {string[]} paths
 * @param {string | string[]} patterns
 * @param {{ basename: string }} options
 */
function match(paths = [], patterns = [], options = {}) {
  let input = paths
  if (paths && patterns) {
    if (paths.length && patterns.length) {
      /** @type {string[]} */
      const output = []
      if (typeof patterns === 'string') patterns = [patterns]
      const exclude = patterns.filter(pattern => pattern.startsWith('!'))
      const include = patterns.filter(pattern => !pattern.startsWith('!'))
      if (exclude.length) input = micromatch(paths, exclude, options)
      if (include.length) {
        for (const pattern of include) {
          let basename = options.basename
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

/**
 * @param {string} original
 * @param {string} ext
 * @param {string} minified
 * @param {string} path
 */
function logFn(original, minified, path, ext) {
  const saved = ((original.length - minified.length) / original.length * 100).toFixed(2)
  const log = this.log || console
  log.log(`${ext}: ${path} [${saved}% saved]`)
}

module.exports = {
  isMatch,
  match,
  logFn
}