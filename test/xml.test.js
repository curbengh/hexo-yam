/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const hexo = new Hexo(__dirname)
global.hexo = hexo
const { xmlDefault } = require('../index')
const x = require('../lib/filter').minifyXml.bind(hexo)
const path = 'foo.xml'
const input = '<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <!-- foo bar -->\n  <title>foo</title>\n</feed>'
const expected = '<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>foo</title></feed>'

describe('xml', () => {
  beforeEach(() => {
    hexo.config.minify.xml = Object.assign({}, xmlDefault)
    // plugin is disabled by default
    hexo.config.minify.xml.enable = true
    hexo.route.set(path, input)
  })

  afterEach(() => {
    const routeList = hexo.route.list()
    routeList.forEach((path) => hexo.route.remove(path))
  })

  test('default', async () => {
    await x()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(expected)
    })
  })

  test('disable', async () => {
    hexo.config.minify.xml.enable = false
    const result = await x()

    expect(result).toBeUndefined()
  })

  test('option - removeComments', async () => {
    hexo.config.minify.xml.removeComments = false

    await x()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toContain('<!-- foo bar -->')
    })
  })

  test('option - verbose', async () => {
    hexo.config.minify.xml.verbose = true
    hexo.log.log = jest.fn()
    await x()

    expect(hexo.log.log.mock.calls[0][0]).toContain(`xml: ${path}`)
  })

  test('empty file', async () => {
    hexo.route.set(path, '')
    const result = await x()

    expect(result).toBeDefined()
    expect(result[0]).toBeUndefined()
  })

  test('include - exclude *.min.xml by default', async () => {
    const path = 'foo.min.xml'
    hexo.route.set(path, input)
    await x()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(input)
    })
  })

  test('include - basename', async () => {
    hexo.config.minify.xml.include = 'bar.xml'
    const path = 'foo/bar.xml'
    hexo.route.set(path, input)
    await x()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(expected)
    })
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.xml.include = '**/lectus/**/*.xml'
    const path = 'eleifend/lectus/nullam/dapibus/netus.xml'
    hexo.route.set(path, input)
    await x()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(expected)
    })
  })

  test('include - basename + slash', async () => {
    hexo.route.remove(path)

    const paths = [
      'lorem/ipsum/dolor.xml',
      'gravida/sociis/erat/ante.xml',
      'aptent/elementum.xml',
      'felis/blandit/cursus.xml'
    ]
    hexo.config.minify.xml.include = [
      'dolor.xml',
      '**/sociis/**/*.xml'
    ]

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await x()

    const minPaths = paths.slice(0, 2)
    const unminPaths = paths.slice(2)

    minPaths.forEach((inpath) => {
      const output = hexo.route.get(inpath)
      let result = ''
      output.on('data', (chunk) => (result += chunk))
      output.on('end', () => {
        expect(result).toBe(expected)
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
      'lorem/ipsum/dolor.xml',
      'gravida/sociis/erat/ante.xml',
      'aptent/elementum.xml',
      'felis/blandit/cursus.xml'
    ]
    hexo.config.minify.xml.include = [
      '!dolor.xml'
    ]
    hexo.config.minify.xml.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await x()

    paths.forEach((inpath) => {
      const output = hexo.route.get(inpath)
      let result = ''
      output.on('data', (chunk) => (result += chunk))
      output.on('end', () => {
        expect(result).toBe(expected)
      })
    })
  })

  test('include - empty route', async () => {
    hexo.route.remove(path)

    const result = await x()
    expect(result.length).toBe(0)
  })
})
