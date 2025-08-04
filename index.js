/* global hexo */
'use strict'

hexo.config.minify = Object.assign({
  enable: true,
  previewServer: true
}, hexo.config.minify)

hexo.config.minify.html = Object.assign({
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
}, hexo.config.minify.html)

hexo.config.minify.css = Object.assign({
  enable: true,
  priority: 10,
  verbose: false,
  exclude: ['*.min.css'],
  level: 2,
  globOptions: { basename: true }
}, hexo.config.minify.css)

hexo.config.minify.js = Object.assign({
  enable: true,
  priority: 10,
  verbose: false,
  exclude: ['*.min.js'],
  compress: {},
  mangle: true,
  output: {},
  globOptions: { basename: true }
}, hexo.config.minify.js)

hexo.config.minify.svg = Object.assign({
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.svg', '!*.min.svg'],
  plugins: {},
  globOptions: { basename: true }
}, hexo.config.minify.svg)

hexo.config.minify.gzip = Object.assign({
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}, hexo.config.minify.gzip)

hexo.config.minify.brotli = Object.assign({
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}, hexo.config.minify.brotli)

hexo.config.minify.zstd = Object.assign({
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true }
}, hexo.config.minify.zstd)

hexo.config.minify.xml = Object.assign({
  enable: false,
  priority: 10,
  verbose: false,
  include: ['*.xml', '!*.min.xml'],
  removeComments: true,
  globOptions: { basename: true }
}, hexo.config.minify.xml)

hexo.config.minify.json = Object.assign({
  enable: false,
  priority: 10,
  verbose: false,
  include: ['*.json', '!*.min.json'],
  globOptions: { basename: true }
}, hexo.config.minify.json)

if (hexo.config.minify.enable === true && !(hexo.config.minify.previewServer === true && ['s', 'server'].includes(hexo.env.cmd))) {
  const filter = require('./lib/filter')
  hexo.extend.filter.register('after_render:html', filter.minifyHtml, hexo.config.minify.html.priority)
  hexo.extend.filter.register('after_render:css', filter.minifyCss, hexo.config.minify.css.priority)
  hexo.extend.filter.register('after_render:js', filter.minifyJs, hexo.config.minify.js.priority)
  hexo.extend.filter.register('after_generate', filter.minifySvg, hexo.config.minify.svg.priority)
  hexo.extend.filter.register('after_generate', filter.gzipFn, hexo.config.minify.gzip.priority)
  hexo.extend.filter.register('after_generate', filter.brotliFn, hexo.config.minify.brotli.priority)
  hexo.extend.filter.register('after_generate', filter.zstdFn, hexo.config.minify.zstd.priority)
  hexo.extend.filter.register('after_generate', filter.minifyXml, hexo.config.minify.xml.priority)
  hexo.extend.filter.register('after_generate', filter.minifyJson, hexo.config.minify.json.priority)
}
