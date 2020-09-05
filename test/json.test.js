/* eslint-env jest */
'use strict'

const Hexo = require('hexo')

describe('xml', () => {
  const hexo = new Hexo(__dirname)
  const jsonFn = require('../lib/filter').minifyJson.bind(hexo)
  const path = 'foo.json'
  const input = '{\n\t"vitae": "hendrerit",\n\t"tristique": [\n\t\t"primis",\n\t\t"quam"\n\t]\n}'
  const expected = '{"vitae":"hendrerit","tristique":["primis","quam"]}'

  beforeEach(() => {
    hexo.config.minify = {
      json: {
        enable: false,
        verbose: false,
        include: ['*.json', '!*.min.json'],
        globOptions: { basename: true }
      }
    }
    // plugin is disabled by default
    hexo.config.minify.json.enable = true
    hexo.route.set(path, input)
  })

  afterEach(() => {
    const routeList = hexo.route.list()
    routeList.forEach((path) => hexo.route.remove(path))
  })

  test('default', async () => {
    await jsonFn()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(expected)
    })
  })

  test('disable', async () => {
    hexo.config.minify.json.enable = false
    const result = await jsonFn()

    expect(result).toBeUndefined()
  })

  test('option - verbose', async () => {
    hexo.config.minify.json.verbose = true
    hexo.log.log = jest.fn()
    await jsonFn()

    expect(hexo.log.log.mock.calls[0][0]).toContain(`json: ${path}`)
  })

  test('invalid input', async () => {
    hexo.route.set(path, 'foo')
    await expect(jsonFn()).rejects.toThrow(/SyntaxError/)
  })

  test('empty file', async () => {
    hexo.route.set(path, '')
    const result = await jsonFn()

    expect(result).toBeDefined()
    expect(result[0]).toBeUndefined()
  })

  test('include - exclude *.min.json by default', async () => {
    const path = 'foo.min.json'
    hexo.route.set(path, input)
    await jsonFn()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(input)
    })
  })

  test('include - basename', async () => {
    hexo.config.minify.json.include = 'bar.json'
    const path = 'foo/bar.json'
    hexo.route.set(path, input)
    await jsonFn()

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(expected)
    })
  })

  test('include - slash in pattern', async () => {
    hexo.config.minify.json.include = '**/lectus/**/*.json'
    const path = 'eleifend/lectus/nullam/dapibus/netus.json'
    hexo.route.set(path, input)
    await jsonFn()

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
      'lorem/ipsum/dolor.json',
      'gravida/sociis/erat/ante.json',
      'aptent/elementum.json',
      'felis/blandit/cursus.json'
    ]
    hexo.config.minify.json.include = [
      'dolor.json',
      '**/sociis/**/*.json'
    ]

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await jsonFn()

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
      'lorem/ipsum/dolor.json',
      'gravida/sociis/erat/ante.json',
      'aptent/elementum.json',
      'felis/blandit/cursus.json'
    ]
    hexo.config.minify.json.include = [
      '!dolor.json'
    ]
    hexo.config.minify.json.globOptions = {
      basename: false
    }

    paths.forEach((inpath) => {
      hexo.route.set(inpath, input)
    })
    await jsonFn()

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

    const result = await jsonFn()
    expect(result.length).toBe(0)
  })
})
