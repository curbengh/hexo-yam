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
    exclude: ['*.min.css']
  }, hexo.config.neat_css)

  // Js minifier
  hexo.config.neat_js = Object.assign({
    enable: true,
    mangle: true,
    logger: false,
    output: {},
    compress: {},
    exclude: ['*.min.js']
  }, hexo.config.neat_js)

  // html, css, js compression
  hexo.config.neat_gzip = Object.assign({
    enable: true,
    logger: false
  }, hexo.config.neat_gzip)

  // html, css, js compression
  hexo.config.neat_brotli = Object.assign({
    enable: true,
    logger: false
  }, hexo.config.neat_brotli)

  const filter = require('./lib/filter')
  hexo.extend.filter.register('after_render:html', filter.logicHtml)
  hexo.extend.filter.register('after_render:css', filter.logicCss)
  hexo.extend.filter.register('after_render:js', filter.logicJs)
  hexo.extend.filter.register('after_generate', filter.logicGzip)
  hexo.extend.filter.register('after_generate', filter.logicBrotli)
}
