# hexo-yam

[![npm version](https://img.shields.io/npm/v/hexo-yam?logo=npm)](https://www.npmjs.com/package/hexo-yam)
[![Build Status](https://img.shields.io/github/actions/workflow/status/curbengh/hexo-yam/tester.yml?branch=master&logo=github)](https://github.com/curbengh/hexo-yam/actions?query=workflow%3ATester)
[![codecov](https://img.shields.io/codecov/c/gh/curbengh/hexo-yam?logo=codecov)](https://codecov.io/gh/curbengh/hexo-yam)
[![NPM Dependencies](https://img.shields.io/librariesio/release/npm/hexo-yam)](https://libraries.io/npm/hexo-yam)
[![Known Vulnerabilities](https://snyk.io/test/github/curbengh/hexo-yam/badge.svg)](https://snyk.io/test/github/curbengh/hexo-yam)

Yet Another Minifier for Hexo. Minify HTML, JS, CSS, SVG, XML and JSON. Compress static [web assets](https://github.com/curbengh/hexo-yam/blob/ba77db0094a7c07ea9f70f010bfc15541d4105ca/index.js#L64) using gzip, brotli and zstd.

## Table of contents

- [Installation](#installation)
- [Options](#options)
- [HTML](#html)
- [CSS](#css)
- [JS](#js)
- [SVG](#svg)
- [XML](#xml)
- [JSON](#json)
- [Gzip](#gzip)
- [Brotli](#brotli)
- [Zstd](#zstd)
- [Globbing](#globbing)

## Installation

```bash
$ npm install --save hexo-yam
```

## Options

```yaml
minify:
  enable: true
  previewServer: true
  html:
  css:
  js:
  svg:
  xml:
  json:
  gzip:
  brotli:
  zstd:
```

- **enable** - Enable the plugin. Defaults to `true`.
- **previewServer** - Disable the plugin when running `hexo server`. Defaults to `true`.
- **html** - See [HTML](#html) section
- **css** - See [CSS](#css) section
- **js** - See [JS](#js) section
- **svg** - See [SVG](#svg) section
- **xml** - See [XML](#xml) section
- **json** - See [JSON](#json) section
- **gzip** - See [Gzip](#gzip) section
- **brotli** - See [Brotli](#brotli) section
- **zstd** - See [Zstd](#zstd) section

## HTML

```yaml
minify:
  html:
    enable: true
    exclude:
```

- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`. Set lower value to set higher priority and vice versa.
- **verbose** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **globOptions** - See [globbing](#globbing) section.

For more options, see [HTMLMinifier](https://github.com/kangax/html-minifier).

## CSS

```yaml
minify:
  css:
    enable: true
    exclude:
      - "*.min.css"
```

- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **level** - Optimization level. Defaults to `2`.
- **sourceMap** - Source map options. Defaults to `false`.
- **mapIncludeSources** - Include sources in map, Defaults to `false`.
- **globOptions** - See [globbing](#globbing) section.

For more options, see [clean-css](https://github.com/jakubpawlowicz/clean-css).

## JS

```yaml
minify:
  js:
    enable: true
    exclude:
      - "*.min.js"
```

- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **compress** - Compress options.
- **mangle** - Mangle variable names. Defaults to `true`. Pass an object to specify [mangle options](https://github.com/terser-js/terser#mangle-options).
- **output** - Output options.
  - To retain comments, `output: {comments: true}`.
- **sourceMap** - Source map options. Defaults to `false`.
  - To include sources in map, `sourceMap: { includeSources: true }`
- **globOptions** - See [globbing](#globbing) section.

For more options, see [Terser](https://github.com/terser-js/terser).

## SVG

```yaml
minify:
  svg:
    enable: true
    include:
      - "*.svg"
      - "!*.min.svg"
```

- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
  - Exclude `*.min.svg` by default.
- **plugins** - Plugin options.
  - Examples:
  ```yaml
  plugins:
    # Retain comments
    removeComments: false
    # Do not remove unused ID attributes
    cleanupIds: false
  ```
  - For more options, see [svgo](https://github.com/svg/svgo).
- **globOptions** - See [globbing](#globbing) section.

## XML

Remove whitespaces in xml.

```yaml
minify:
  xml:
    enable: false
    include:
      - "*.xml"
      - "!*.min.xml"
```

- **enable** - Enable the plugin. Defaults to `false`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
  - Exclude `*.min.xml` by default.
- **removeComments** - Remove [comments](https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction) in xml. Defaults to `true`.
- **globOptions** - See [globbing](#globbing) section.

For more options, see [minify-xml](https://github.com/kristian/minify-xml#options).

## JSON

Remove whitespaces in json.

```yaml
minify:
  json:
    enable: false
    include:
      - "*.json"
      - "*.webmanifest"
      - "!*.min.json"
      - "!*.min.webmanifest"
```

- **enable** - Enable the plugin. Defaults to `false`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
  - Exclude `*.min.json` by default.
- **globOptions** - See [globbing](#globbing) section.

## Gzip

```yaml
minify:
  gzip:
    enable: true
    include:
      - "*.html"
      - "*.css"
      - "*.js"
      - "*.map"
      - "*.wasm"
      - "*.txt"
      - "*.ttf"
      - "*.atom"
      - "*.stl"
      - "*.xml"
      - "*.svg"
      - "*.eot"
      - "*.json"
      - "*.webmanifest"
```

- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
  - Support one-liner, `include: ['*.html','*.css','*.js']`.
  - Must include asterisk and single quotes. `.html` is invalid. `'*.html'` is valid.
- **ensureCompressed** - Ensure the compressed file is smaller than the original, otherwise do not output. Defaults to `true`.
- **globOptions** - See [globbing](#globbing) section.
- **level** - Compression level; lower value may results in faster compression but slightly larger (compressed) file. Range `1-9`. Defaults to `9`, or the value of [`zlib.constants.Z_BEST_COMPRESSION`](https://nodejs.org/docs/latest-v12.x/api/zlib.html#zlib_zlib_constants)

## Brotli

```yaml
minify:
  brotli:
    enable: true
    include:
      - "*.html"
      - "*.css"
      - "*.js"
      - "*.map"
      - "*.wasm"
      - "*.txt"
      - "*.ttf"
      - "*.atom"
      - "*.stl"
      - "*.xml"
      - "*.svg"
      - "*.eot"
      - "*.json"
      - "*.webmanifest"
```

- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **ensureCompressed** - Ensure the compressed file is smaller than the original, otherwise do not output. Defaults to `true`.
- **globOptions** - See [globbing](#globbing) section.
- **level** - Compression level. Range `1-11`. Defaults to `11`, or the value of [`zlib.constants.BROTLI_MAX_QUALITY`](https://nodejs.org/docs/latest-v12.x/api/zlib.html#zlib_brotli_constants)

## Zstd

```yaml
minify:
  zstd:
    enable: false
    include:
      - "*.html"
      - "*.css"
      - "*.js"
      - "*.map"
      - "*.wasm"
      - "*.txt"
      - "*.ttf"
      - "*.atom"
      - "*.stl"
      - "*.xml"
      - "*.svg"
      - "*.eot"
      - "*.json"
      - "*.webmanifest"
```

- **enable** - Enable the plugin. Defaults to `false`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **ensureCompressed** - Ensure the compressed file is smaller than the original, otherwise do not output. Defaults to `true`.
- **globOptions** - See [globbing](#globbing) section.
- **level** - Compression level. Range `1-22`. Defaults to `3`, or the value of [`DEFAULT_LEVEL`](https://github.com/mongodb-js/zstd/blob/a3a08c61c9045411c8275e248498dbc583457fb5/src/lib.rs#L9)

### Cannot find module '@mongodb-js/zstd-linux-x64-gnu'

`npm install --save @mongodb-js/zstd-linux-x64-gnu`

- @mongodb-js/zstd-darwin-arm64 (Apple Silicon)
- @mongodb-js/zstd-darwin-x64 (Intel Mac)
- @mongodb-js/zstd-linux-arm64-gnu
- @mongodb-js/zstd-linux-arm64-musl (Alpine)
- @mongodb-js/zstd-linux-x64-gnu
- @mongodb-js/zstd-linux-x64-musl (Alpine)
- @mongodb-js/zstd-win32-x64-msvc

## Globbing

Use "globOptions" to customise how glob patterns match files. Refer to [micromatch](https://github.com/micromatch/micromatch#options) for available options.

- basename is enabled by default, unless the pattern has a slash.
- basename is disabled depending on each pattern.
- This means the following options would work,

```yml
exclude:
  - "*foo.html" # basename is enabled
  - "**/bar/*/*.html" # basename is automatically disabled
  - "*baz.css" # basename is enabled
globOptions:
  basename: true # default
```

- This behaviour doesn't apply to pattern that starts with `!` (negation).
- This limitation only applies to `include:` option used in svg, gzip and brotli.
- This means the following options would _not_ work,

```yml
include:
  - "!foo.svg"
  - "!**/bar/*/*.svg"
globOptions:
  basename: true
```

- basename will stay disabled, if explicitly disabled in "globOptions".

## Credits

All credits go to the following work:

- [hexo-neat](https://github.com/rozbo/hexo-neat) by rozbo
- gzip feature is inspired by [hexo-generator-optimize](https://github.com/JackyRen/hexo-generator-optimize)
