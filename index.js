/* global hexo */
'use strict'

hexo.config.minify = {
  enable: true,
  previewServer: true,
  ...hexo.config.minify
}

hexo.config.minify.html = {
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
  globOptions: { basename: true },
  ...hexo.config.minify.html
}

hexo.config.minify.css = {
  enable: true,
  priority: 10,
  verbose: false,
  exclude: ['*.min.css'],
  level: 2,
  globOptions: { basename: true },
  ...hexo.config.minify.css
}

hexo.config.minify.js = {
  enable: true,
  priority: 10,
  verbose: false,
  exclude: ['*.min.js'],
  compress: {},
  mangle: true,
  output: {},
  globOptions: { basename: true },
  ...hexo.config.minify.js
}

hexo.config.minify.svg = {
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.svg', '!*.min.svg'],
  plugins: {},
  globOptions: { basename: true },
  ...hexo.config.minify.svg
}

hexo.config.minify.gzip = {
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true },
  ...hexo.config.minify.gzip
}

hexo.config.minify.brotli = {
  enable: true,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true },
  ...hexo.config.minify.brotli
}

hexo.config.minify.zstd = {
  enable: false,
  priority: 10,
  verbose: false,
  include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
  globOptions: { basename: true },
  ...hexo.config.minify.zstd
}

hexo.config.minify.xml = {
  enable: false,
  priority: 10,
  verbose: false,
  include: ['*.xml', '!*.min.xml'],
  removeComments: true,
  globOptions: { basename: true },
  ...hexo.config.minify.xml
}

hexo.config.minify.json = {
  enable: false,
  priority: 10,
  verbose: false,
  include: ['*.json', '!*.min.json'],
  globOptions: { basename: true },
  ...hexo.config.minify.json
}

if (hexo.config.minify.enable === true && !(hexo.config.minify.previewServer === true && ['s', 'server'].includes(hexo.env.cmd))) {
  if (hexo.config.minify.html.enable === true) {
    hexo.extend.filter.register('after_render:html', require('./lib/html').minifyHtml, hexo.config.minify.html.priority)
  }
  if (hexo.config.minify.css.enable === true) {
    hexo.extend.filter.register('after_render:css', require('./lib/css').minifyCss, hexo.config.minify.css.priority)
  }
  if (hexo.config.minify.js.enable === true) {
    hexo.extend.filter.register('after_render:js', require('./lib/js').minifyJs, hexo.config.minify.js.priority)
  }
  if (hexo.config.minify.svg.enable === true) {
    hexo.extend.filter.register('after_generate', require('./lib/svg').minifySvg, hexo.config.minify.svg.priority)
  }
  if (hexo.config.minify.gzip.enable || hexo.config.minify.brotli.enable) {
    const zlib = require('./lib/zlib')
    if (hexo.config.minify.gzip.enable === true) {
      hexo.extend.filter.register('after_generate', zlib.gzipFn, hexo.config.minify.gzip.priority)
    }
    if (hexo.config.minify.brotli.enable === true) {
      hexo.extend.filter.register('after_generate', zlib.brotliFn, hexo.config.minify.brotli.priority)
    }
  }
  if (hexo.config.minify.zstd.enable === true) {
    try {
      hexo.extend.filter.register('after_generate', require('./lib/zstd').zstdFn, hexo.config.minify.zstd.priority)
    } catch (ex) {
      const log = hexo.log || console
      log.warn(`ZSTD load failed. ${ex}`)
    }
  }
  if (hexo.config.minify.xml.enable === true) {
    hexo.extend.filter.register('after_generate', require('./lib/xml').minifyXml, hexo.config.minify.xml.priority)
  }
  if (hexo.config.minify.json.enable === true) {
    hexo.extend.filter.register('after_generate', require('./lib/json').minifyJson, hexo.config.minify.json.priority)
  }
}