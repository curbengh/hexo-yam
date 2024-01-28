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
  let expected = ''

  beforeAll(async () => {
    expected = await htmlMinify(input, defaultCfg.html)
  })

  beforeEach(() => {
    hexo.config.minify = JSON.parse(JSON.stringify(defaultCfg))
  })

  test('default', async () => {
    const result = await h(input, { path })

    expect(result).toBe(expected)
  })

  test('disable', async () => {
    hexo.config.minify.html.enable = false

    const result = await h(input, { path })

    expect(result).toBeUndefined()
  })

  test('empty file', async () => {
    const result = await h('', { path })

    expect(result).toBeUndefined()
  })

  test('option', async () => {
    const customOpt = { removeEmptyAttributes: false }
    hexo.config.minify.html = customOpt

    const result = await h(input, { path })
    const expected = await htmlMinify(input, customOpt)

    expect(result).toBe(input)
    expect(result).toBe(expected)
  })

  test('option - verbose', async () => {
    hexo.config.minify.html.verbose = true
    hexo.log.log = jest.fn()
    await h(input, { path })

    expect(hexo.log.log.mock.calls[0][0]).toContain(`html: ${path}`)
  })

  test('exclude', async () => {
    const exclude = '*.min.html'
    hexo.config.minify.html.exclude = exclude

    const result = await h(input, { path: 'foo/bar.min.html' })

    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', async () => {
    const exclude = '**/lectus/**/*.html'
    hexo.config.minify.html.exclude = exclude

    const result = await h(input, { path: 'eleifend/lectus/nullam/dapibus/netus.html' })

    expect(result).toBe(input)
  })

  test('exclude - basename is true + slash', async () => {
    const exclude = ['**/lectus/**/*.html', 'bar.html']
    const globOptions = { basename: true }
    hexo.config.minify.html.exclude = exclude
    hexo.config.minify.html.globOptions = globOptions

    const result = await h(input, { path: 'foo/bar.html' })

    expect(result).toBe(input)
  })

  test('exclude - basename is false + slash', async () => {
    const exclude = ['**/lectus/**/*.html', 'bar.html']
    const globOptions = { basename: false }
    hexo.config.minify.html.exclude = exclude
    hexo.config.minify.html.globOptions = globOptions

    const result = await h(input, { path: 'foo/bar.html' })

    expect(result).toBe(expected)
  })

  test('null', async () => {
    hexo.config.minify.html.exclude = null
    hexo.config.minify.html.globOptions = null

    const result = await h(input, { path: null })

    expect(result).toBe(expected)
  })

  test('invalid string', async () => {
    const invalid = '<html><>?:"{}|_+</html>'

    await expect(h(invalid, { path })).rejects.toThrow('Parse Error: <>?:"{}|_+</html>')
  })
})
