/* eslint-env jest */
'use strict'

const { promisify } = require('util')
const Hexo = require('hexo')
const hexo = new Hexo(__dirname)
global.hexo = hexo

describe('html', () => {
  const { htmlDefault } = require('../index')
  const h = require('../lib/filter').minifyHtml.bind(hexo)
  const Htmlminifier = require('html-minifier').minify

  beforeEach(() => {
    hexo.config.minify.html = Object.assign({}, htmlDefault)
  })

  test('default', () => {
    const input = '<p id="">foo</p>'
    const result = h(input, { path: '' })
    const expected = Htmlminifier(input, hexo.config.minify.html)

    expect(result).toBe(expected)
  })

  test('disable', () => {
    hexo.config.minify.html.enable = false

    const input = '<p id="">foo</p>'
    const result = h(input, { path: '' })

    expect(result).toBeUndefined()
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
    hexo.config.minify.css = Object.assign({}, cssDefault)
  })

  test('default', async () => {
    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: '' })
    const { styles } = await new CleanCSS(hexo.config.minify.css).minify(input)
    expect(result).toBe(styles)
  })

  test('disable', async () => {
    hexo.config.minify.css.enable = false
    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: '' })
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

    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    const result = await c(input, { path: '' })
    const { styles } = await new CleanCSS(customOpt).minify(input)
    expect(result).toBe(styles)
  })

  test('option - invalid', async () => {
    const customOpt = {
      level: 9000
    }
    hexo.config.minify.css = customOpt

    const input = 'foo { bar: baz; } foo { aaa: bbb; }'
    let result, expected

    try {
      await c(input, { path: '' })
    } catch (err) {
      result = err.message
    }
    try {
      await new CleanCSS(customOpt).minify(input)
    } catch (err) {
      expected = err.message
    }

    expect(result).toContain(expected)
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
    hexo.config.minify.js = Object.assign({}, jsDefault)
  })

  test('default', () => {
    const input = 'var o = { "foo": 1, bar: 3 };'
    const result = j(input, { path: '' })
    const { code } = Terser.minify(input, { mangle: jsDefault.mangle })

    expect(result).toBeDefined()
    expect(code).toBeDefined()
    expect(result).toBe(code)
  })

  test('disable', () => {
    hexo.config.minify.js.enable = false

    const input = 'var o = { "foo": 1, bar: 3 };'
    const result = j(input, { path: '' })

    expect(result).toBeUndefined()
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

describe('svg', () => {
  const { svgDefault } = require('../index')
  const s = require('../lib/filter').minifySvg.bind(hexo)
  const Svgo = require('svgo')
  const path = 'foo.svg'
  const input = '<svg><rect x="1" y="2" width="3" height="4" id="a"/></svg>'

  beforeEach(() => {
    hexo.config.minify.svg = Object.assign({}, svgDefault)
    hexo.route.set(path, input)
  })

  afterEach(() => {
    const routeList = hexo.route.list()
    routeList.forEach((path) => hexo.route.remove(path))
  })

  test('default', async () => {
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(data)
    })
  })

  test('disable', async () => {
    hexo.config.minify.svg.enable = false
    const result = await s()
    expect(result).toBeUndefined()
  })

  test('option', async () => {
    const customOpt = [{ cleanupIDs: false }]
    hexo.config.minify.svg.plugins = customOpt
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(data)
      expect(result).toContain('id="a"')
    })
  })

  test('invalid svg', async () => {
    const input = '{}'
    hexo.route.set(path, input)
    let expected
    try {
      await new Svgo(hexo.config.minify.svg).optimize(input)
    } catch (err) {
      expected = err
    }
    try {
      await s()
    } catch (err) {
      expect(err.message).toContain(expected)
    }
  })

  test('include - exclude *.min.svg by default', async () => {
    const path = 'foo.min.svg'
    hexo.route.set(path, input)
    await s()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(input)
    })
  })

  test('include - basename', async () => {
    hexo.config.minify.svg.include = 'bar.svg'
    const fooPath = 'foo/bar.svg'
    hexo.route.set(fooPath, input)
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    const output = hexo.route.get(fooPath)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(data)
    })
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.svg.include = '**/foo/*.svg'
    const fooPath = 'blog/site/example/foo/bar.svg'
    hexo.route.set(fooPath, input)
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    const output = hexo.route.get(fooPath)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(data)
    })
  })
})

describe('gzip', () => {
  const { gzipDefault } = require('../index')
  const g = require('../lib/filter').gzipFn.bind(hexo)
  const zlib = require('zlib')
  const gzip = promisify(zlib.gzip)
  const unzip = promisify(zlib.unzip)
  const path = 'foo.txt'
  const input = 'Lorem ipsum dolor sit amet consectetur adipiscing elit fusce'

  beforeEach(() => {
    hexo.config.minify.gzip = Object.assign({}, gzipDefault)
    hexo.route.set(path, input)
  })

  afterEach(() => {
    const routeList = hexo.route.list()
    routeList.forEach((path) => hexo.route.remove(path))
  })

  test('default', async () => {
    await g()

    const output = hexo.route.get(path.concat('.gz'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await gzip(input, { level: zlib.constants.Z_BEST_COMPRESSION })
      const resultUnzip = await unzip(result)
      const expectedUnzip = await unzip(expected)

      expect(result.toString('base64')).toBe(Buffer.from(expected, 'binary').toString('base64'))
      expect(resultUnzip.toString()).toBe(input)
      expect(expectedUnzip.toString()).toBe(input)
    })
  })

  test('disable', async () => {
    hexo.config.minify.gzip.enable = false
    const result = await g()

    expect(result).toBeUndefined()
  })

  test('option', async () => {
    const customOpt = {
      level: 1
    }
    hexo.config.minify.gzip.level = customOpt.level
    await g()

    const output = hexo.route.get(path.concat('.gz'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await gzip(input, customOpt)

      expect(result.toString('base64')).toBe(Buffer.from(expected, 'binary').toString('base64'))
    })
  })

  test('option - invalid', async () => {
    const customOpt = {
      level: 9000
    }
    hexo.config.minify.gzip.level = customOpt.level

    let expected
    try {
      await gzip(input, customOpt)
    } catch (err) {
      expected = err.message
    }
    try {
      await g()
    } catch (err) {
      expect(err.message).toContain(expected)
    }
  })

  test('include - exclude non-text file by default', async () => {
    const path = 'foo.jpg'
    hexo.route.set(path, input)
    await g()

    const result = hexo.route.get(path.concat('.gz'))
    expect(result).toBeUndefined()
  })

  test('include - basename', async () => {
    hexo.config.minify.gzip.include = 'bar.txt'
    const fooPath = 'foo/bar.txt'
    hexo.route.set(fooPath, input)
    await g()

    const result = hexo.route.get(fooPath.concat('.gz'))
    expect(result).toBeDefined()
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.gzip.include = '**/foo/*.txt'
    const fooPath = 'blog/site/example/foo/bar.txt'
    hexo.route.set(fooPath, input)
    await g()

    const result = hexo.route.get(fooPath.concat('.gz'))
    expect(result).toBeDefined()
  })
})

describe('brotli', () => {
  const { brotliDefault } = require('../index')
  const b = require('../lib/filter').brotliFn.bind(hexo)
  const zlib = require('zlib')
  const brotli = promisify(zlib.brotliCompress)
  const unbrotli = promisify(zlib.brotliDecompress)
  const path = 'foo.txt'
  const input = 'Lorem ipsum dolor sit amet consectetur adipiscing elit fusce'

  beforeEach(() => {
    hexo.config.minify.brotli = Object.assign({}, brotliDefault)
    hexo.route.set(path, input)
  })

  afterEach(() => {
    const routeList = hexo.route.list()
    routeList.forEach((path) => hexo.route.remove(path))
  })

  test('default', async () => {
    await b()

    const output = hexo.route.get(path.concat('.br'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await brotli(input)
      const resultUnbr = await unbrotli(result)
      const expectedUnbr = await unbrotli(expected)

      expect(result.toString('base64')).toBe(Buffer.from(expected, 'binary').toString('base64'))
      expect(resultUnbr.toString()).toBe(input)
      expect(expectedUnbr.toString()).toBe(input)
    })
  })

  test('disable', async () => {
    hexo.config.minify.brotli.enable = false
    const result = await b()

    expect(result).toBeUndefined()
  })

  test('option - invalid', async () => {
    const level = 'foo'
    hexo.config.minify.brotli.level = level

    let expected
    try {
      await brotli(input, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level } })
    } catch (err) {
      expected = err.message
    }
    try {
      await b()
    } catch (err) {
      expect(err.message).toContain(expected)
    }
  })

  test('include - exclude non-text file by default', async () => {
    const path = 'foo.jpg'
    hexo.route.set(path, input)
    await b()

    const result = hexo.route.get(path.concat('.br'))
    expect(result).toBeUndefined()
  })

  test('include - basename', async () => {
    hexo.config.minify.brotli.include = 'bar.txt'
    const fooPath = 'foo/bar.txt'
    hexo.route.set(fooPath, input)
    await b()

    const result = hexo.route.get(fooPath.concat('.br'))
    expect(result).toBeDefined()
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.brotli.include = '**/foo/*.txt'
    const fooPath = 'blog/site/example/foo/bar.txt'
    hexo.route.set(fooPath, input)
    await b()

    const result = hexo.route.get(fooPath.concat('.br'))
    expect(result).toBeDefined()
  })
})
