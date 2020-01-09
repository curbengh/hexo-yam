/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const hexo = new Hexo(__dirname)
global.hexo = hexo
const { jsDefault } = require('../index')
const j = require('../lib/filter').minifyJs.bind(hexo)
const Terser = require('terser')
const input = 'var o = { "foo": 1, bar: 3 };'
const path = 'foo.js'
const expected = Terser.minify(input, { mangle: jsDefault.mangle }).code

describe('js', () => {
  beforeEach(() => {
    hexo.config.minify.js = Object.assign({}, jsDefault)
  })

  test('default', () => {
    const result = j(input, { path })

    expect(result).toBeDefined()
    expect(expected).toBeDefined()
    expect(result).toBe(expected)
  })

  test('disable', () => {
    hexo.config.minify.js.enable = false

    const result = j(input, { path })

    expect(result).toBeUndefined()
  })

  test('empty file', () => {
    const result = j('', { path })

    expect(result).toBeUndefined()
  })

  test('option', () => {
    const customOpt = {
      mangle: {
        properties: true
      }
    }
    hexo.config.minify.js = customOpt

    const result = j(input, { path })
    const expected = Terser.minify(input, customOpt).code

    expect(result).toBe(expected)
  })

  test('option - verbose', () => {
    hexo.config.minify.js.verbose = true
    hexo.log.log = jest.fn()
    j(input, { path })

    expect(hexo.log.log.mock.calls[0][0]).toContain(`js: ${path}`)
  })

  test('option - invalid', () => {
    const customOpt = {
      mangle: {
        foo: 'bar'
      }
    }
    hexo.config.minify.js = customOpt

    const { error } = Terser.minify(input, customOpt)

    expect(error.message).toBeDefined()
    expect(() => {
      j(input, { path })
    }).toThrow(error.message)
  })

  test('exclude - *.min.js', () => {
    const result = j(input, { path: 'foo/bar.min.js' })

    expect(result).toBe(input)
  })

  test('exclude - basename', () => {
    const exclude = '*baz.js'
    hexo.config.minify.js.exclude = exclude
    const result = j(input, { path: 'foo/barbaz.js' })

    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', () => {
    const exclude = '**/lectus/**/*.js'
    hexo.config.minify.js.exclude = exclude
    const result = j(input, { path: 'eleifend/lectus/nullam/dapibus/netus.js' })

    expect(result).toBe(input)
  })
})
