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
  const input = '<p id="">foo</p>'
  const path = 'index.html'

  beforeEach(() => {
    hexo.config.minify.html = Object.assign({}, htmlDefault)
  })

  test('default', () => {
    const result = h(input, { path })
    const expected = Htmlminifier(input, hexo.config.minify.html)

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
    const expected = Htmlminifier(input, customOpt)

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
    const expected = Htmlminifier(input, hexo.config.minify.html)

    expect(result).toBe(expected)
  })

  test('null', () => {
    hexo.config.minify.html.exclude = null
    hexo.config.minify.html.globOptions = null

    const result = h(input, { path: null })
    const expected = Htmlminifier(input, hexo.config.minify.html)

    expect(result).toBe(expected)
  })
})

describe('css', () => {
  const { cssDefault } = require('../index')
  const c = require('../lib/filter').minifyCss.bind(hexo)
  const CleanCSS = require('clean-css')
  const input = 'foo { bar: baz; } foo { aaa: bbb; }'
  const path = 'foo.css'

  beforeEach(() => {
    hexo.config.minify.css = Object.assign({}, cssDefault)
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

    let result, expected

    try {
      await c(input, { path })
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

describe('js', () => {
  const { jsDefault } = require('../index')
  const j = require('../lib/filter').minifyJs.bind(hexo)
  const Terser = require('terser')
  const input = 'var o = { "foo": 1, bar: 3 };'
  const path = 'foo.js'

  beforeEach(() => {
    hexo.config.minify.js = Object.assign({}, jsDefault)
  })

  test('default', () => {
    const result = j(input, { path })
    const { code } = Terser.minify(input, { mangle: jsDefault.mangle })

    expect(result).toBeDefined()
    expect(code).toBeDefined()
    expect(result).toBe(code)
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
    const { code } = Terser.minify(input, customOpt)

    expect(result).toBe(code)
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
    try {
      j(input, { path })
    } catch (err) {
      expect(err.message).toContain(error.message)
    }
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

describe('svg', () => {
  const { svgDefault } = require('../index')
  const s = require('../lib/filter').minifySvg.bind(hexo)
  const Svgo = require('svgo')
  const input = '<svg><rect x="1" y="2" width="3" height="4" id="a"/></svg>'
  const path = 'foo.svg'

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

  test('empty file', async () => {
    hexo.route.set(path, '')
    const result = await s()

    // empty file resolves to an array of undefined
    expect(result).toBeDefined()
    expect(result[0]).toBeUndefined()
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

  test('option - verbose', async () => {
    hexo.config.minify.svg.verbose = true
    hexo.log.log = jest.fn()
    await s()

    expect(hexo.log.log.mock.calls[0][0]).toContain(`svg: ${path}`)
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
    const path = 'foo/bar.svg'
    hexo.route.set(path, input)
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(data)
    })
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.svg.include = '**/lectus/**/*.svg'
    const path = 'eleifend/lectus/nullam/dapibus/netus.svg'
    hexo.route.set(path, input)
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(data)
    })
  })

  test('include - basename + slash', async () => {
    hexo.route.remove(path)

    const paths = [
      'lorem/ipsum/dolor.svg',
      'gravida/sociis/erat/ante.svg',
      'aptent/elementum.svg',
      'felis/blandit/cursus.svg'
    ]
    hexo.config.minify.svg.include = [
      'dolor.svg',
      '**/sociis/**/*.svg'
    ]

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    const minPaths = paths.slice(0, 2)
    const unminPaths = paths.slice(2)

    minPaths.forEach((inpath) => {
      const output = hexo.route.get(inpath)
      let result = ''
      output.on('data', (chunk) => (result += chunk))
      output.on('end', () => {
        expect(result).toBe(data)
      })
    })

    unminPaths.forEach((inpath) => {
      const output = hexo.route.get(inpath)
      let result = ''
      output.on('data', (chunk) => (result += chunk))
      output.on('end', () => {
        expect(result).toBe(input)
      })
    })
  })

  test('include - reverse pattern + basename disabled', async () => {
    hexo.route.remove(path)

    const paths = [
      'lorem/ipsum/dolor.svg',
      'gravida/sociis/erat/ante.svg',
      'aptent/elementum.svg',
      'felis/blandit/cursus.svg'
    ]
    hexo.config.minify.svg.include = [
      '!dolor.svg'
    ]
    hexo.config.minify.svg.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await s()
    const { data } = await new Svgo(hexo.config.minify.svg).optimize(input)

    paths.forEach((inpath) => {
      const output = hexo.route.get(inpath)
      let result = ''
      output.on('data', (chunk) => (result += chunk))
      output.on('end', () => {
        expect(result).toBe(data)
      })
    })
  })

  test('include - empty route', async () => {
    hexo.route.remove(path)

    const result = await s()
    expect(result.length).toBe(0)
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
    // empty file resolves to an array of undefined
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
