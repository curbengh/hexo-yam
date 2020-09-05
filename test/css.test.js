/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const CleanCSS = require('clean-css')

describe('css', () => {
  const hexo = new Hexo(__dirname)
  const c = require('../lib/filter').minifyCss.bind(hexo)
  const input = 'foo { bar: baz; } foo { aaa: bbb; }'
  const path = 'foo.css'

  beforeEach(() => {
    hexo.config.minify = {
      css: {
        enable: true,
        verbose: false,
        exclude: ['*.min.css'],
        level: 2,
        globOptions: { basename: true }
      }
    }
  })

  test('default', async () => {
    const result = await c(input, { path })
    const { styles } = await new CleanCSS(hexo.config.minify.css).minify(input)

    expect(result).toBe(styles)
  })

  test('disable', async () => {
    hexo.config.minify.css.enable = false
    const result = await c(input, { path })

    expect(result).toBeUndefined()
  })

  test('empty file', async () => {
    const result = await c('', { path })

    expect(result).toBeUndefined()
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

    const result = await c(input, { path })
    const { styles } = await new CleanCSS(customOpt).minify(input)

    expect(result).toBe(styles)
  })

  test('option - verbose', async () => {
    hexo.config.minify.css.verbose = true
    hexo.log.log = jest.fn()
    await c(input, { path })

    expect(hexo.log.log.mock.calls[0][0]).toContain(`css: ${path}`)
  })

  test('option - invalid', async () => {
    const customOpt = {
      level: 9000
    }
    hexo.config.minify.css = customOpt

    let expected
    try {
      await new CleanCSS(customOpt).minify(input)
    } catch (err) {
      expected = err
    }

    expect(expected).toBeDefined()
    await expect(c(input, { path })).rejects.toThrow(`Path: ${path}\n${expected}`)
  })

  test('exclude - *.min.css', async () => {
    const result = await c(input, { path: 'foo/bar.min.css' })

    expect(result).toBe(input)
  })

  test('exclude - basename', async () => {
    const exclude = '*baz.css'
    hexo.config.minify.css.exclude = exclude
    const result = await c(input, { path: 'foo/barbaz.css' })

    expect(result).toBe(input)
  })

  test('exclude - slash in pattern', async () => {
    const exclude = '**/lectus/**/*.css'
    hexo.config.minify.css.exclude = exclude
    const result = await c(input, { path: 'eleifend/lectus/nullam/dapibus/netus.css' })

    expect(result).toBe(input)
  })
})
