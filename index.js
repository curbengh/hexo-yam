/* global hexo */
'use strict'

const minifyDefault = { enable: true }
const htmlDefault = {
  enable: true,
  priority: 10,
  verbose: false,
  exclude: [],
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  // Ignore '<!-- more -->' https://hexo.io/docs/tag-plugins#Post-Excerpt
  ignoreCustomComments: [/^\s*more/],
  removeComments: true,
  removeEmptyAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyJS: true,
  minifyCSS: true,
  globOptions: { basename: true }
}
const cssDefault = {
  enable: true,
  priority: 10,
  verbose: false,
  exclude: ['*.min.css'],
  level: 2,
  globOptions: { basename: true }
}
const jsDefault = {
  enable: true,
  priority: 10,
  verbose: false,
  exclude: ['*.min.js'],
  compress: {},
  mangle: true,
  output: {},
  globOptions: { basename: true }
}
const svgDefault = {
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.svg', '!*.min.svg'],
  plugins: [],
  globOptions: { basename: true }
}
const gzipDefault = {
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}
const brotliDefault = {
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}

hexo.config.minify = Object.assign(minifyDefault, hexo.config.minify)
hexo.config.minify.html = Object.assign(htmlDefault, hexo.config.minify.html)
hexo.config.minify.css = Object.assign(cssDefault, hexo.config.minify.css)
hexo.config.minify.js = Object.assign(jsDefault, hexo.config.minify.js)
hexo.config.minify.svg = Object.assign(svgDefault, hexo.config.minify.svg)
hexo.config.minify.gzip = Object.assign(gzipDefault, hexo.config.minify.gzip)
hexo.config.minify.brotli = Object.assign(brotliDefault, hexo.config.minify.brotli)

if (hexo.config.minify.enable === true) {
  const filter = require('./lib/filter')
  hexo.extend.filter.register('after_render:html', filter.minifyHtml, hexo.config.minify.html.priority)
  hexo.extend.filter.register('after_render:css', filter.minifyCss, hexo.config.minify.css.priority)
  hexo.extend.filter.register('after_render:js', filter.minifyJs, hexo.config.minify.js.priority)
  hexo.extend.filter.register('after_generate', filter.minifySvg, hexo.config.minify.svg.priority)
  hexo.extend.filter.register('after_generate', filter.gzipFn, hexo.config.minify.gzip.priority)
  hexo.extend.filter.register('after_generate', filter.brotliFn, hexo.config.minify.brotli.priority)
}

module.exports = {
  minifyDefault,
  htmlDefault,
  cssDefault,
  jsDefault,
  svgDefault,
  gzipDefault,
  brotliDefault
}
