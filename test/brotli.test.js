/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const hexo = new Hexo(__dirname)
global.hexo = hexo
const { brotliDefault } = require('../index')
const b = require('../lib/filter').brotliFn.bind(hexo)
const zlib = require('zlib')
const { promisify } = require('util')
const brotli = promisify(zlib.brotliCompress)
const unbrotli = promisify(zlib.brotliDecompress)
const path = 'foo.txt'
const input = 'Lorem ipsum dolor sit amet consectetur adipiscing elit fusce'

describe('brotli', () => {
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

      expect(result.equals(expected)).toBe(true)
      expect(resultUnbr.toString()).toBe(input)
      expect(expectedUnbr.toString()).toBe(input)
    })
  })

  test('disable', async () => {
    hexo.config.minify.brotli.enable = false
    const result = await b()

    expect(result).toBeUndefined()
  })

  test('empty file', async () => {
    hexo.route.set(path, '')

    const routeList = hexo.route.list()
    expect(routeList).not.toContain(path.concat('.br'))

    const result = await b()
    expect(result).toBeDefined()
    expect(result[0]).toBeUndefined()
  })

  test('option', async () => {
    const level = 1
    hexo.config.minify.brotli.level = level
    await b()

    const output = hexo.route.get(path.concat('.br'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await brotli(input, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level } })

      expect(result.equals(expected)).toBe(true)
    })
  })

  test('option - verbose', async () => {
    hexo.config.minify.brotli.verbose = true
    hexo.log.log = jest.fn()
    await b()

    expect(hexo.log.log.mock.calls[0][0]).toContain(`brotli: ${path}`)
  })

  test('option - level is string', async () => {
    const level = 'foo'
    hexo.config.minify.brotli.level = level
    await b()

    const output = hexo.route.get(path.concat('.br'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await brotli(input, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY } })

      expect(result.equals(expected)).toBe(true)
    })
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
    const path = 'foo/bar.txt'
    hexo.route.set(path, input)
    await b()

    const result = hexo.route.get(path.concat('.br'))

    expect(result).toBeDefined()
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.brotli.include = '**/lectus/**/*.txt'
    const path = 'eleifend/lectus/nullam/dapibus/netus.txt'
    hexo.route.set(path, input)
    await b()

    const result = hexo.route.get(path.concat('.br'))

    expect(result).toBeDefined()
  })

  test('include - basename + slash + basename enabled', async () => {
    hexo.route.remove(path)

    const paths = [
      'lorem/ipsum/dolor.html',
      'gravida/sociis/erat/ante.css',
      'aptent/elementum.js',
      'felis/blandit/cursus.svg'
    ]
    hexo.config.minify.brotli.include = [
      '*.html',
      '**/sociis/**/*.css'
    ]

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await b()

    const routeList = hexo.route.list()
    const expected = [
      'lorem/ipsum/dolor.html.br',
      'gravida/sociis/erat/ante.css.br'
    ]
    const notExpected = [
      'aptent/elementum.js.br',
      'felis/blandit/cursus.svg.br'
    ]

    expect(routeList).toEqual(expect.arrayContaining(expected))
    expect(routeList).toEqual(expect.not.arrayContaining(notExpected))
  })

  test('include - basename + slash + basename disabled', async () => {
    hexo.route.remove(path)

    const paths = [
      'lorem/ipsum/dolor.html',
      'gravida/sociis/erat/ante.css',
      'aptent/elementum.js',
      'felis/blandit/cursus.svg'
    ]
    hexo.config.minify.brotli.include = [
      '*.html',
      '**/sociis/**/*.css'
    ]
    hexo.config.minify.brotli.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await b()

    const routeList = hexo.route.list()
    const expected = [
      'gravida/sociis/erat/ante.css.br'
    ]
    const notExpected = [
      'lorem/ipsum/dolor.html.br',
      'aptent/elementum.js.br',
      'felis/blandit/cursus.svg.br'
    ]

    expect(routeList).toEqual(expect.arrayContaining(expected))
    expect(routeList).toEqual(expect.not.arrayContaining(notExpected))
  })

  test('include - reverse pattern + basename disabled', async () => {
    hexo.route.remove(path)

    const paths = [
      'lorem/ipsum/dolor.html',
      'gravida/sociis/erat/ante.css',
      'aptent/elementum.js',
      'felis/blandit/cursus.svg'
    ]
    hexo.config.minify.brotli.include = [
      '!dolor.html'
    ]
    hexo.config.minify.brotli.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await b()

    const routeList = hexo.route.list()
    const expected = paths.map((path) => path.concat('.br'))

    expect(routeList).toEqual(expect.arrayContaining(expected))
  })
})
