/* global hexo */
'use strict'

hexo.config.minify = Object.assign({
  enable: true
}, hexo.config.minify)

hexo.config.minify.html = Object.assign({
  enable: true,
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
  logger: false,
  exclude: ['*.min.css'],
  level: 2,
  globOptions: { basename: true }
}, hexo.config.minify.css)

hexo.config.minify.js = Object.assign({
  enable: true,
  logger: false,
  exclude: ['*.min.js'],
  compress: {},
  mangle: true,
  output: {},
  globOptions: { basename: true }
}, hexo.config.minify.js)

hexo.config.minify.svg = Object.assign({
  enable: true,
  logger: false,
  include: ['*.svg', '!*.min.svg'],
  plugins: [],
  globOptions: { basename: true }
}, hexo.config.minify.svg)

hexo.config.minify.gzip = Object.assign({
  enable: true,
  logger: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}, hexo.config.minify.gzip)

hexo.config.minify.brotli = Object.assign({
  enable: true,
  logger: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}, hexo.config.minify.brotli)

if (hexo.config.minify.enable === true) {
  const filter = require('./lib/filter')
  hexo.extend.filter.register('after_render:html', filter.logicHtml)
  hexo.extend.filter.register('after_render:css', filter.logicCss)
  hexo.extend.filter.register('after_render:js', filter.logicJs)
  hexo.extend.filter.register('after_generate', filter.logicSvg)
  hexo.extend.filter.register('after_generate', filter.logicGzip)
  hexo.extend.filter.register('after_generate', filter.logicBrotli)
}
