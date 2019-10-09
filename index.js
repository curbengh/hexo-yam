/* global hexo */
'use strict'

hexo.config.minify = Object.assign({
  enable: true
}, hexo.config.minify)

hexo.config.minify.html = Object.assign({
  enable: true,
  priority: 10,
  logger: false,
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
}, hexo.config.minify.html)

hexo.config.minify.css = Object.assign({
  enable: true,
  priority: 10,
  // TODO: rename to verbose
  logger: false,
  exclude: ['*.min.css'],
  level: 2,
  globOptions: { basename: true }
}, hexo.config.minify.css)

hexo.config.minify.js = Object.assign({
  enable: true,
  priority: 10,
  logger: false,
  exclude: ['*.min.js'],
  compress: {},
  mangle: true,
  output: {},
  globOptions: { basename: true }
}, hexo.config.minify.js)

hexo.config.minify.svg = Object.assign({
  enable: true,
  priority: 10,
  logger: false,
  include: ['*.svg', '!*.min.svg'],
  plugins: [],
  globOptions: { basename: true }
}, hexo.config.minify.svg)

hexo.config.minify.gzip = Object.assign({
  enable: true,
  priority: 10,
  logger: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}, hexo.config.minify.gzip)

hexo.config.minify.brotli = Object.assign({
  enable: true,
  priority: 10,
  logger: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}, hexo.config.minify.brotli)

if (hexo.config.minify.enable === true) {
  const filter = require('./lib/filter')
  hexo.extend.filter.register('after_render:html', filter.minifyHtml, hexo.config.minify.html.priority)
  hexo.extend.filter.register('after_render:css', filter.minifyCss, hexo.config.minify.css.priority)
  hexo.extend.filter.register('after_render:js', filter.minifyJs, hexo.config.minify.js.priority)
  hexo.extend.filter.register('after_generate', filter.minifySvg, hexo.config.minify.svg.priority)
  hexo.extend.filter.register('after_generate', filter.gzipFn, hexo.config.minify.gzip.priority)
  hexo.extend.filter.register('after_generate', filter.brotliFn, hexo.config.minify.brotli.priority)
}
