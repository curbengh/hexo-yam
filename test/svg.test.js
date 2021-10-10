/* eslint-env jest */
'use strict'

const Hexo = require('hexo')
const { optimize: svgOptimize } = require('svgo')

describe('svg', () => {
  const hexo = new Hexo(__dirname)
  const s = require('../lib/filter').minifySvg.bind(hexo)
  const input = '<svg><rect x="1" y="2" width="3" height="4" id="a"/></svg>'
  const path = 'foo.svg'
  // svgo's plugins option
  let plugins = [{
    name: 'preset-default',
    params: {
      overrides: {}
    }
  }]

  beforeEach(() => {
    hexo.config.minify = {
      svg: {
        enable: true,
        verbose: false,
        include: ['*.svg', '!*.min.svg'],
        plugins: {},
        globOptions: { basename: true }
      }
    }
    plugins = [{
      name: 'preset-default',
      params: {
        overrides: {}
      }
    }]
    hexo.route.set(path, input)
  })

  afterEach(() => {
    const routeList = hexo.route.list()
    routeList.forEach((path) => hexo.route.remove(path))
  })

  test('default', async () => {
    await s()
    const { data } = svgOptimize(input, { plugins })

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
    const customOpt = {
      cleanupIDs: false
    }
    hexo.config.minify.svg.plugins = customOpt
    plugins = [{
      name: 'preset-default',
      params: {
        overrides: customOpt
      }
    }]
    await s()
    const { data } = svgOptimize(input, { plugins })

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

  test('option - plugins - invalid', async () => {
    hexo.config.minify.svg.plugins = 'invalid'
    await s()
    const { data } = svgOptimize(input, { plugins })

    const output = hexo.route.get(path)
    let result = ''
    output.on('data', (chunk) => (result += chunk))
    output.on('end', () => {
      expect(result).toBe(data)
    })
  })

  test('invalid svg', async () => {
    const input = '{}'
    hexo.route.set(path, input)

    const { error } = svgOptimize(input, { plugins })

    expect(error).toBeDefined()
    await expect(s()).rejects.toThrow(`Path: ${path}\n${error}`)
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
    const { data } = svgOptimize(input, { plugins })

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
    const { data } = svgOptimize(input, { plugins })

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
    const { data } = svgOptimize(input, { plugins })

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
    const { data } = svgOptimize(input, { plugins })

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
