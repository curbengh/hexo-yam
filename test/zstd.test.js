/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const { compress: zstd, decompress: unzstd } = require('@mongodb-js/zstd')

describe('zstd', () => {
  const hexo = new Hexo(__dirname)
  const z = require('../lib/filter').zstdFn.bind(hexo)
  const path = 'foo.txt'
  const input = 'Lorem ipsum dolor sit amet consectetur adipiscing elit fusce'
  const inputBuf = Buffer.from(input, 'utf8')

  beforeEach(() => {
    hexo.config.minify = {
      zstd: {
        enable: true,
        verbose: false,
        include: ['*.html', '*.css', '*.js', '*.txt', '*.ttf', '*.atom', '*.stl', '*.xml', '*.svg', '*.eot', '*.json'],
        globOptions: { basename: true }
      }
    }
    hexo.route.set(path, input)
  })

  afterEach(() => {
    const routeList = hexo.route.list()
    routeList.forEach((path) => hexo.route.remove(path))
  })

  test('default', async () => {
    await z()

    const output = hexo.route.get(path.concat('.zst'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await zstd(inputBuf)
      const resultUnzst = await unzstd(result)
      const expectedUnzst = await unzstd(expected)

      expect(result.equals(expected)).toBe(true)
      expect(resultUnzst.toString()).toBe(input)
      expect(expectedUnzst.toString()).toBe(input)
    })
  })

  test('disable', async () => {
    hexo.config.minify.zstd.enable = false
    const result = await z()

    expect(result).toBeUndefined()
  })

  test('empty file', async () => {
    hexo.route.set(path, '')

    const routeList = hexo.route.list()
    expect(routeList).not.toContain(path.concat('.zst'))

    const result = await z()
    expect(result).toBeDefined()
    expect(result[0]).toBeUndefined()
  })

  test('option', async () => {
    const level = 1
    hexo.config.minify.zstd.level = level
    await z()

    const output = hexo.route.get(path.concat('.zst'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await zstd(inputBuf, level)

      expect(result.equals(expected)).toBe(true)
    })
  })

  test('option - verbose', async () => {
    hexo.config.minify.zstd.verbose = true
    hexo.log.log = jest.fn()
    await z()

    expect(hexo.log.log.mock.calls[0][0]).toContain(`zstd: ${path}`)
  })

  test('option - level is string', async () => {
    const level = 'foo'
    hexo.config.minify.zstd.level = level
    await z()

    const output = hexo.route.get(path.concat('.zst'))
    const buf = []
    output.on('data', (chunk) => (buf.push(chunk)))
    output.on('end', async () => {
      const result = Buffer.concat(buf)
      const expected = await zstd(inputBuf, undefined)

      expect(result.equals(expected)).toBe(true)
    })
  })

  test('include - exclude non-text file by default', async () => {
    const path = 'foo.jpg'
    hexo.route.set(path, input)
    await z()

    const result = hexo.route.get(path.concat('.zst'))

    expect(result).toBeUndefined()
  })

  test('include - basename', async () => {
    hexo.config.minify.zstd.include = 'bar.txt'
    const path = 'foo/bar.txt'
    hexo.route.set(path, input)
    await z()

    const result = hexo.route.get(path.concat('.zst'))

    expect(result).toBeDefined()
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.zstd.include = '**/lectus/**/*.txt'
    const path = 'eleifend/lectus/nullam/dapibus/netus.txt'
    hexo.route.set(path, input)
    await z()

    const result = hexo.route.get(path.concat('.zst'))

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
    hexo.config.minify.zstd.include = [
      '*.html',
      '**/sociis/**/*.css'
    ]

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await z()

    const routeList = hexo.route.list()
    const expected = [
      'lorem/ipsum/dolor.html.zst',
      'gravida/sociis/erat/ante.css.zst'
    ]
    const notExpected = [
      'aptent/elementum.js.zst',
      'felis/blandit/cursus.svg.zst'
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
    hexo.config.minify.zstd.include = [
      '*.html',
      '**/sociis/**/*.css'
    ]
    hexo.config.minify.zstd.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await z()

    const routeList = hexo.route.list()
    const expected = [
      'gravida/sociis/erat/ante.css.zst'
    ]
    const notExpected = [
      'lorem/ipsum/dolor.html.zst',
      'aptent/elementum.js.zst',
      'felis/blandit/cursus.svg.zst'
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
    hexo.config.minify.zstd.include = [
      '!dolor.html'
    ]
    hexo.config.minify.zstd.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await z()

    const routeList = hexo.route.list()
    const expected = paths.map((path) => path.concat('.zst'))

    expect(routeList).toEqual(expect.arrayContaining(expected))
  })

  test('blns', async () => {
    const blns = require('./fixtures/blns.json')

    for (const nStr of blns) {
      hexo.route.remove(path)

      hexo.route.set(path, nStr)

      await z()

      const output = hexo.route.get(path.concat('.zst'))
      const buf = []
      output.on('data', (chunk) => (buf.push(chunk)))
      output.on('end', async () => {
        const result = Buffer.concat(buf)
        const resultUnzst = await unzstd(result)

        expect(resultUnzst.toString()).toBe(nStr)
      })
    }
  })
})
