/* global hexo */
if (hexo.config.neat_enable === true) {
  // HTML minifier
  hexo.config.neat_html = Object.assign({
    enable: true,
    logger: false,
    exclude: [],
    ignoreCustomComments: [/^\s*more/],
    removeComments: true,
    removeCommentsFromCDATA: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeEmptyAttributes: true,
    minifyJS: true,
    minifyCSS: true
  }, hexo.config.neat_html)

  // Css minifier
  hexo.config.neat_css = Object.assign({
    enable: true,
    logger: false,
    exclude: ['*.min.css'],
    level: 2
  }, hexo.config.neat_css)

  // Js minifier
  hexo.config.neat_js = Object.assign({
    enable: true,
    logger: false,
    exclude: ['*.min.js'],
    mangle: true,
    output: {},
    compress: {}
  }, hexo.config.neat_js)

  // gzip compression
  hexo.config.neat_gzip = Object.assign({
    enable: true,
    logger: false,
    include: ['*.html','*.css','*.js','*.txt','*.ttf','*.atom','*.stl','*.xml','*.svg','*.eot','*.json']
  }, hexo.config.neat_gzip)

  // brotli compression
  hexo.config.neat_brotli = Object.assign({
    enable: true,
    logger: false,
    include: ['*.html','*.css','*.js','*.txt','*.ttf','*.atom','*.stl','*.xml','*.svg','*.eot','*.json']
  }, hexo.config.neat_brotli)

  const filter = require('./lib/filter')
  hexo.extend.filter.register('after_render:html', filter.logicHtml)
  hexo.extend.filter.register('after_render:css', filter.logicCss)
  hexo.extend.filter.register('after_render:js', filter.logicJs)
  hexo.extend.filter.register('after_generate', filter.logicGzip)
  hexo.extend.filter.register('after_generate', filter.logicBrotli)
}
