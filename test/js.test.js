/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const { minify: jsMinify } = require('@swc/core')

describe('js', () => {
  const hexo = new Hexo(__dirname)
  const j = require('../lib/filter').minifyJs.bind(hexo)
  const input = 'var o = { "foo": 1, bar: 3 };'
  const path = 'foo.js'
  let expected = ''

  beforeAll(async () => {
    const { code } = await jsMinify(input, { mangle: true })
    expected = code
  })

  beforeEach(async () => {
    hexo.config.minify = {
      js: {
        enable: true,
        verbose: false,
        exclude: ['*.min.js'],
        compress: {},
        mangle: true,
        format: {},
        globOptions: { basename: true }
      }
    }
  })

  test('default', async () => {
    const result = await j(input, { path })

    expect(result).toBeDefined()
    expect(expected).toBeDefined()
    expect(result).toBe(expected)
  })

  test('disable', async () => {
    hexo.config.minify.js.enable = false

    const result = await j(input, { path })

    expect(result).toBeUndefined()
  })

  test('empty file', async () => {
    const result = await j('', { path })

    expect(result).toBeUndefined()
  })

  test('option', async () => {
    const customOpt = {
      mangle: {
        properties: {}
      }
    }
    hexo.config.minify.js = customOpt

    const result = await j(input, { path })
    const { code: expected } = await jsMinify(input, customOpt)

    expect(result).toBe(expected)
  })

  test('option - verbose', async () => {
    hexo.config.minify.js.verbose = true
    hexo.log.log = jest.fn()
    await j(input, { path })

    expect(hexo.log.log.mock.calls[0][0]).toContain(`js: ${path}`)
  })

  test('option - invalid', async () => {
    const customOpt = {
      mangle: {
        foo: 'bar'
      }
    }
    hexo.config.minify.js = customOpt

    let expected
    try {
      await jsMinify(input, customOpt)
    } catch (err) {
      expected = err
    }

    expect(expected).toBeDefined()
    await expect(j(input, { path })).rejects.toThrow(`Path: ${path}\n${expected}`)
  })

  test('exclude - *.min.js', async () => {
    const result = await j(input, { path: 'foo/bar.min.js' })

    expect(result).toBe(input)
  })

  test('exclude - basename', async () => {
    const exclude = '*baz.js'
    hexo.config.minify.js.exclude = exclude
    const result = await j(input, { path: 'foo/barbaz.js' })

    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', async () => {
    const exclude = '**/lectus/**/*.js'
    hexo.config.minify.js.exclude = exclude
    const result = await j(input, { path: 'eleifend/lectus/nullam/dapibus/netus.js' })

    expect(result).toBe(input)
  })

  test('invalid string', async () => {
    const invalid = 'console.log("\\");'

    let expected
    try {
      await jsMinify(invalid)
    } catch (err) {
      expected = err
    }

    expect(expected).toBeDefined()
    await expect(j(invalid, { path })).rejects.toThrow(`Path: ${path}\n${expected}`)
  })
})
