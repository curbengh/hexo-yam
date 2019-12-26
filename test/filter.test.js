/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const hexo = new Hexo(__dirname)
global.hexo = hexo

describe('html', () => {
  const { htmlDefault } = require('../index')
  const h = require('../lib/filter').minifyHtml.bind(hexo)
  const Htmlminifier = require('html-minifier').minify

  beforeEach(() => {
    hexo.config.minify.html = htmlDefault
  })

  test('default', () => {
    const input = '<p id="">foo</p>'
    const result = h(input, { path: '' })
    const expected = Htmlminifier(input, hexo.config.minify.html)

    expect(result).toBe(expected)
  })

  test('option', () => {
    const customOpt = { removeEmptyAttributes: false }
    hexo.config.minify.html = customOpt

    const input = '<p id="">foo</p>'
    const result = h(input, { path: '' })
    const expected = Htmlminifier(input, customOpt)

    expect(result).toBe(input)
    expect(result).toBe(expected)
  })

  test('exclude', () => {
    const exclude = '*.min.html'
    hexo.config.minify.html.exclude = exclude

    const input = '<p id="">foo</p>'
    const result = h(input, { path: 'foo/bar.min.html' })

    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', () => {
    const exclude = '**/bar.html'
    hexo.config.minify.html.exclude = exclude

    const input = '<p id="">foo</p>'
    const result = h(input, { path: 'foo/bar.html' })

    expect(result).toBe(input)
  })

  test('exclude - basename is true + slash', () => {
    const exclude = ['**/baz', 'bar.html']
    const globOptions = { basename: true }
    hexo.config.minify.html.exclude = exclude
    hexo.config.minify.html.globOptions = globOptions

    const input = '<p id="">foo</p>'
    const result = h(input, { path: 'foo/bar.html' })

    expect(result).toBe(input)
  })

  test('exclude - basename is false + slash', () => {
    const exclude = ['**/baz', 'bar.html']
    const globOptions = { basename: false }
    hexo.config.minify.html.exclude = exclude
    hexo.config.minify.html.globOptions = globOptions

    const input = '<p id="">foo</p>'
    const result = h(input, { path: 'foo/bar.html' })
    const expected = Htmlminifier(input, hexo.config.minify.html)

    expect(result).toBe(expected)
  })

  test('null', () => {
    hexo.config.minify.html.exclude = null
    hexo.config.minify.html.globOptions = null

    const input = '<p id="">foo</p>'
    const result = h(input, { path: null })
    const expected = Htmlminifier(input, hexo.config.minify.html)

    expect(result).toBe(expected)
  })
})

describe('css', () => {
  const { cssDefault } = require('../index')
  const c = require('../lib/filter').minifyCss.bind(hexo)
  const CleanCSS = require('clean-css')

  beforeEach(() => {
    hexo.config.minify.css = cssDefault
  })

  test('default', async () => {
    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: '' })
    const { styles } = await new CleanCSS(hexo.config.minify.css).minify(input)
    expect(result).toBe(styles)
  })

  test('option', async () => {
    const customOpt = {
      level: {
        1: {
          mergeAdjacentRules: false
        }
      }
    }
    hexo.config.minify.css = customOpt

    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: '' })
    const { styles } = await new CleanCSS(customOpt).minify(input)
    expect(result).toBe(styles)
  })

  test('exclude - *.min.css', async () => {
    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: 'foo/bar.min.css' })
    expect(result).toBe(input)
  })

  test('exclude - basename', async () => {
    const exclude = '*baz.css'
    hexo.config.minify.css.exclude = exclude
    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: 'foo/barbaz.css' })
    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', async () => {
    const exclude = '**/bar.css'
    hexo.config.minify.css.exclude = exclude
    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: 'foo/bar.css' })
    expect(result).toBe(input)
  })
})

describe('js', () => {
  const { jsDefault } = require('../index')
  const j = require('../lib/filter').minifyJs.bind(hexo)
  const Terser = require('terser')

  beforeEach(() => {
    hexo.config.minify.js = jsDefault
  })

  test('default', () => {
    const input = 'var o = { "foo": 1, bar: 3 };'
    const result = j(input, { path: '' })
    const { code } = Terser.minify(input, { mangle: jsDefault.mangle })
    expect(result).toBe(code)
  })

  test('option', () => {
    const customOpt = {
      mangle: {
        properties: true
      }
    }
    hexo.config.minify.js = customOpt

    const input = 'var o = { "foo": 1, bar: 3 };'
    const result = j(input, { path: '' })
    const { code } = Terser.minify(input, customOpt)
    expect(result).toBe(code)
  })

  test('option - invalid', () => {
    const customOpt = {
      mangle: {
        foo: 'bar'
      }
    }
    hexo.config.minify.js = customOpt

    const input = 'var o = { "foo": 1, bar: 3 };'
    const { error } = Terser.minify(input, customOpt)
    try {
      j(input, { path: '' })
    } catch (err) {
      expect(err.message).toContain(error.message)
    }
  })

  test('exclude - *.min.js', () => {
    const input = 'var o = { "foo": 1, bar: 3 };'
    const result = j(input, { path: 'foo/bar.min.js' })
    expect(result).toBe(input)
  })

  test('exclude - basename', () => {
    const exclude = '*baz.js'
    hexo.config.minify.js.exclude = exclude
    const input = 'var o = { "foo": 1, bar: 3 };'
    const result = j(input, { path: 'foo/barbaz.js' })
    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', () => {
    const exclude = '**/bar.js'
    hexo.config.minify.js.exclude = exclude
    const input = 'var o = { "foo": 1, bar: 3 };'
    const result = j(input, { path: 'foo/bar.js' })
    expect(result).toBe(input)
  })
})
