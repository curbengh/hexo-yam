/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const { minify: htmlMinify } = require('html-minifier-terser')

describe('html', () => {
  const hexo = new Hexo(__dirname)
  const h = require('../lib/filter').minifyHtml.bind(hexo)
  const input = '<p id="">foo</p>'
  const path = 'index.html'
  const defaultCfg = {
    html: {
      enable: true,
      verbose: false,
      exclude: [],
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      ignoreCustomComments: [/^\s*more/],
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true,
      globOptions: { basename: true }
    }
  }
  const expected = htmlMinify(input, defaultCfg.html)

  beforeEach(() => {
    hexo.config.minify = JSON.parse(JSON.stringify(defaultCfg))
  })

  test('default', () => {
    const result = h(input, { path })

    expect(result).toBe(expected)
  })

  test('disable', () => {
    hexo.config.minify.html.enable = false

    const result = h(input, { path })

    expect(result).toBeUndefined()
  })

  test('empty file', () => {
    const result = h('', { path })

    expect(result).toBeUndefined()
  })

  test('option', () => {
    const customOpt = { removeEmptyAttributes: false }
    hexo.config.minify.html = customOpt

    const result = h(input, { path })
    const expected = htmlMinify(input, customOpt)

    expect(result).toBe(input)
    expect(result).toBe(expected)
  })

  test('option - verbose', () => {
    hexo.config.minify.html.verbose = true
    hexo.log.log = jest.fn()
    h(input, { path })

    expect(hexo.log.log.mock.calls[0][0]).toContain(`html: ${path}`)
  })

  test('exclude', () => {
    const exclude = '*.min.html'
    hexo.config.minify.html.exclude = exclude

    const result = h(input, { path: 'foo/bar.min.html' })

    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', () => {
    const exclude = '**/lectus/**/*.html'
    hexo.config.minify.html.exclude = exclude

    const result = h(input, { path: 'eleifend/lectus/nullam/dapibus/netus.html' })

    expect(result).toBe(input)
  })

  test('exclude - basename is true + slash', () => {
    const exclude = ['**/lectus/**/*.html', 'bar.html']
    const globOptions = { basename: true }
    hexo.config.minify.html.exclude = exclude
    hexo.config.minify.html.globOptions = globOptions

    const result = h(input, { path: 'foo/bar.html' })

    expect(result).toBe(input)
  })

  test('exclude - basename is false + slash', () => {
    const exclude = ['**/lectus/**/*.html', 'bar.html']
    const globOptions = { basename: false }
    hexo.config.minify.html.exclude = exclude
    hexo.config.minify.html.globOptions = globOptions

    const result = h(input, { path: 'foo/bar.html' })

    expect(result).toBe(expected)
  })

  test('null', () => {
    hexo.config.minify.html.exclude = null
    hexo.config.minify.html.globOptions = null

    const result = h(input, { path: null })

    expect(result).toBe(expected)
  })

  test('invalid string', () => {
    const invalid = '<html><>?:"{}|_+</html>'

    expect(() => {
      h(invalid, { path })
    }).toThrow(`Path: ${path}\nError: Parse Error`)
  })
})
