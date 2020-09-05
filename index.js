/* global hexo */
'use strict'

hexo.config.minify = Object.assign({
  enable: true,
  html: {
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
  },
  css: {
    enable: true,
    priority: 10,
    verbose: false,
    exclude: ['*.min.css'],
    level: 2,
    globOptions: { basename: true }
  },
  js: {
    enable: true,
    priority: 10,
    verbose: false,
    exclude: ['*.min.js'],
    compress: {},
    mangle: true,
    output: {},
    globOptions: { basename: true }
  },
  svg: {
    enable: true,
    priority: 10,
    verbose: false,
    include: ['*.svg', '!*.min.svg'],
    plugins: [],
    globOptions: { basename: true }
  },
  gzip: {
    enable: true,
    priority: 10,
    verbose: false,
    include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
    globOptions: { basename: true }
  },
  brotli: {
    enable: true,
    priority: 10,
    verbose: false,
    include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
    globOptions: { basename: true }
  },
  xml: {
    enable: false,
    priority: 10,
    verbose: false,
    include: ['*.xml', '!*.min.xml'],
    removeComments: true,
    globOptions: { basename: true }
  },
  json: {
    enable: false,
    priority: 10,
    verbose: false,
    include: ['*.json', '!*.min.json'],
    globOptions: { basename: true }
  }
}, hexo.config.minify)

if (hexo.config.minify.enable === true) {
  const filter = require('./lib/filter')
  hexo.extend.filter.register('after_render:html', filter.minifyHtml, hexo.config.minify.html.priority)
  hexo.extend.filter.register('after_render:css', filter.minifyCss, hexo.config.minify.css.priority)
  hexo.extend.filter.register('after_render:js', filter.minifyJs, hexo.config.minify.js.priority)
  hexo.extend.filter.register('after_generate', filter.minifySvg, hexo.config.minify.svg.priority)
  hexo.extend.filter.register('after_generate', filter.gzipFn, hexo.config.minify.gzip.priority)
  hexo.extend.filter.register('after_generate', filter.brotliFn, hexo.config.minify.brotli.priority)
  hexo.extend.filter.register('after_generate', filter.minifyXml, hexo.config.minify.xml.priority)
  hexo.extend.filter.register('after_generate', filter.minifyJson, hexo.config.minify.json.priority)
}
