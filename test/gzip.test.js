/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const hexo = new Hexo(__dirname)
global.hexo = hexo
const { gzipDefault } = require('../index')
const g = require('../lib/filter').gzipFn.bind(hexo)
const zlib = require('zlib')
const { promisify } = require('util')
const gzip = promisify(zlib.gzip)
const unzip = promisify(zlib.unzip)
const path = 'foo.txt'
const input = 'Lorem ipsum dolor sit amet consectetur adipiscing elit fusce'

describe('gzip', () => {
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

      expect(result.equals(expected)).toBe(true)
      expect(resultUnzip.toString()).toBe(input)
      expect(expectedUnzip.toString()).toBe(input)
    })
  })

  test('disable', async () => {
    hexo.config.minify.gzip.enable = false
    const result = await g()

    expect(result).toBeUndefined()
  })

  test('empty file', async () => {
    hexo.route.set(path, '')

    const routeList = hexo.route.list()
    expect(routeList).not.toContain(path.concat('.gz'))

    const result = await g()
    // empty file resolves to an array of undefined
    expect(result).toBeDefined()
    expect(result[0]).toBeUndefined()
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

      expect(result.equals(expected)).toBe(true)
    })
  })

  test('option - verbose', async () => {
    hexo.config.minify.gzip.verbose = true
    hexo.log.log = jest.fn()
    await g()

    expect(hexo.log.log.mock.calls[0][0]).toContain(`gzip: ${path}`)
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
    expect(expected).toBeDefined()
    await expect(g()).rejects.toThrow(expected)
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
    const path = 'foo/bar.txt'
    hexo.route.set(path, input)
    await g()

    const result = hexo.route.get(path.concat('.gz'))

    expect(result).toBeDefined()
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.gzip.include = '**/lectus/**/*.txt'
    const path = 'eleifend/lectus/nullam/dapibus/netus.txt'
    hexo.route.set(path, input)
    await g()

    const result = hexo.route.get(path.concat('.gz'))

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
    hexo.config.minify.gzip.include = [
      '*.html',
      '**/sociis/**/*.css'
    ]

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await g()

    const routeList = hexo.route.list()
    const expected = [
      'lorem/ipsum/dolor.html.gz',
      'gravida/sociis/erat/ante.css.gz'
    ]
    const notExpected = [
      'aptent/elementum.js.gz',
      'felis/blandit/cursus.svg.gz'
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
    hexo.config.minify.gzip.include = [
      '*.html',
      '**/sociis/**/*.css'
    ]
    hexo.config.minify.gzip.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await g()

    const routeList = hexo.route.list()
    const expected = [
      'gravida/sociis/erat/ante.css.gz'
    ]
    const notExpected = [
      'lorem/ipsum/dolor.html.gz',
      'aptent/elementum.js.gz',
      'felis/blandit/cursus.svg.gz'
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
    hexo.config.minify.gzip.include = [
      '!dolor.html'
    ]
    hexo.config.minify.gzip.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await g()

    const routeList = hexo.route.list()
    const expected = paths.map((path) => path.concat('.gz'))

    expect(routeList).toEqual(expect.arrayContaining(expected))
  })

  test('blns', async () => {
    const blns = require('./fixtures/blns.json')

    for (const nStr of blns) {
      hexo.route.remove(path)

      hexo.route.set(path, nStr)

      await g()

      const output = hexo.route.get(path.concat('.gz'))
      const buf = []
      output.on('data', (chunk) => (buf.push(chunk)))
      output.on('end', async () => {
        const result = Buffer.concat(buf)
        const resultUnzip = await unzip(result)

        expect(resultUnzip.toString()).toBe(nStr)
      })
    }
  })
})
