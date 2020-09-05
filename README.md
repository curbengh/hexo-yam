# hexo-yam

[![npm version](https://img.shields.io/npm/v/hexo-yam?logo=npm)](https://www.npmjs.com/package/hexo-yam)
[![Build Status](https://img.shields.io/github/workflow/status/curbengh/hexo-yam/Tester?logo=github)](https://github.com/curbengh/hexo-yam/actions?query=workflow%3ATester)
[![codecov](https://img.shields.io/codecov/c/gh/curbengh/hexo-yam?logo=codecov)](https://codecov.io/gh/curbengh/hexo-yam)
[![NPM Dependencies](https://img.shields.io/librariesio/release/npm/hexo-yam)](https://libraries.io/npm/hexo-yam)
[![Known Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/hexo-yam?logo=snyk)](https://snyk.io/test/npm/hexo-yam)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/curbengh/hexo-yam.svg?logo=lgtm)](https://lgtm.com/projects/g/curbengh/hexo-yam/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/curbengh/hexo-yam.svg?logo=lgtm)](https://lgtm.com/projects/g/curbengh/hexo-yam/context:javascript)

Yet Another Minifier for Hexo. Minify and compress HTML, JS, CSS, SVG, XML and JSON. [Other files](https://github.com/curbengh/hexo-yam/blob/ba77db0094a7c07ea9f70f010bfc15541d4105ca/index.js#L64) are also compressed. Support gzip and [brotli](https://en.wikipedia.org/wiki/Brotli) [compressions](https://en.wikipedia.org/wiki/HTTP_compression).


## Table of contents

- [Version 4](#version-4)
- [Installation](#installation)
- [Options](#options)
- [HTML](#html)
- [CSS](#css)
- [JS](#js)
- [SVG](#svg)
- [Gzip](#gzip)
- [Brotli](#brotli)
- [XML](#xml)
- [JSON](#json)
- [Globbing](#globbing)
- [HTTP Compression](#http-compression)

## Version 4
In v4, `logger:` option has been renamed to `verbose:`

Migrate:

``` diff
minify:
  html:
-    logger: true
+    verbose: true
```

## Installation
``` bash
$ npm install hexo-yam --save
```

## Options

``` yaml
minify:
  enable: true
  html:
  css:
  js:
  svg:
  gzip:
  brotli:
```

- **enable** - Enable the plugin. Defaults to `true`.
- **html** - See [HTML](#html) section
- **css** - See [CSS](#css) section
- **js** - See [JS](#js) section
- **svg** - See [SVG](#svg) section
- **gzip** - See [Gzip](#gzip) section
- **brotli** - See [Brotli](#brotli) section

## HTML

``` yaml
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

``` yaml
minify:
  css:
    enable: true
    exclude:
      - '*.min.css'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **level** - Optimization level. Defaults to `2`.
- **globOptions** - See [globbing](#globbing) section.

For more options, see [clean-css](https://github.com/jakubpawlowicz/clean-css).

## JS

``` yaml
minify:
  js:
    enable: true
    exclude:
      - '*.min.js'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **compress** - Compress options.
- **mangle** - Mangle variable names. Defaults to `true`. Pass an object to specify [mangle options](https://github.com/terser-js/terser#mangle-options).
- **output** - Output options.
  - To retain comments, `output: {comments: true}`.
- **globOptions** - See [globbing](#globbing) section.

For more options, see [Terser](https://github.com/terser-js/terser).

## SVG

``` yaml
minify:
  svg:
    enable: true
    include:
      - '*.svg'
      - '!*.min.svg'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
  - Exclude `*.min.svg` by default.
- **plugins** - Plugin options.
  - Example: to retain comments, `plugins: [{removeComments: false}]`.
  - For more options, see [svgo](https://github.com/svg/svgo).
- **globOptions** - See [globbing](#globbing) section.

## Gzip

``` yaml
minify:
  gzip:
    enable: true
    include:
      - '*.html'
      - '*.css'
      - '*.js'
      - '*.txt'
      - '*.ttf'
      - '*.atom'
      - '*.stl'
      - '*.xml'
      - '*.svg'
      - '*.eot'
      - '*.json'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
  - Support one-liner, `include: ['*.html','*.css','*.js']`.
  - Must include asterisk and single quotes. `.html` is invalid. `'*.html'` is valid.
- **globOptions** - See [globbing](#globbing) section.
- **level** - Compression level; lower value may results in faster compression but slightly larger (compressed) file. Range `1-9`. Defaults to `9`, or the value of [`zlib.constants.Z_BEST_COMPRESSION`](https://nodejs.org/docs/latest-v12.x/api/zlib.html#zlib_zlib_constants)

## Brotli

``` yaml
minify:
  brotli:
    enable: true
    include:
      - '*.html'
      - '*.css'
      - '*.js'
      - '*.txt'
      - '*.ttf'
      - '*.atom'
      - '*.stl'
      - '*.xml'
      - '*.svg'
      - '*.eot'
      - '*.json'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
- **globOptions** - See [globbing](#globbing) section.
- **level** - Compression level. Range `1-11`. Defaults to `11`, or the value of [`zlib.constants.BROTLI_MAX_QUALITY`](https://nodejs.org/docs/latest-v12.x/api/zlib.html#zlib_brotli_constants)

## XML

Remove whitespaces in xml.

``` yaml
minify:
  xml:
    enable: false
    include:
      - '*.xml'
      - '!*.min.xml'
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

``` yaml
minify:
  json:
    enable: false
    include:
      - '*.json'
      - '!*.min.json'
```
- **enable** - Enable the plugin. Defaults to `false`.
- **priority** - Plugin's priority. Defaults to `10`.
- **verbose** - Verbose output. Defaults to `false`.
- **include** - Include files. Support [wildcard](http://www.globtester.com/) pattern(s) in a string or array.
  - Exclude `*.min.json` by default.
- **globOptions** - See [globbing](#globbing) section.

## Globbing

Use "globOptions" to customise how glob patterns match files. Refer to [micromatch](https://github.com/micromatch/micromatch#options) for available options.

- basename is enabled by default, unless the pattern has a slash.
- basename is disabled depending on each pattern.
- This means the following options would work,

``` yml
exclude:
  - '*foo.html' # basename is enabled
  - '**/bar/*/*.html' # basename is automatically disabled
  - '*baz.css' # basename is enabled
globOptions:
  basename: true # default
```

- This behaviour doesn't apply to pattern that starts with `!` (negation).
- This limitation only applies to `include:` option used in svg, gzip and brotli.
- This means the following options would *not* work,

``` yml
include:
  - '!foo.svg'
  - '!**/bar/*/*.svg'
globOptions:
  basename: true
```

- basename will stay disabled, if explicitly disabled in "globOptions".


## HTTP Compression

While most modern web browsers [support Brotli](https://www.caniuse.com/#feat=brotli), you also need to consider whether the web/app server, hosting platform, reverse proxy or CDN (whichever relevant to you) support it.

As of May 2019, GitHub Pages, GitLab Pages and Netlify *do not* support brotli yet. You can generate `.br` files, but they won't serve those files.

Name | Status (May 8, 2019)
--- | ---
GitHub Pages | [In consideration](https://github.community/t5/GitHub-Pages/Support-for-pre-compressed-assets-and-brotli-compression/m-p/22055)
GitLab Pages | [In progress](https://gitlab.com/gitlab-org/gitlab-pages/merge_requests/120)
Netlify | [In consideration](https://postimg.cc/qgxn0261)
Hexo Server | [In progress](https://github.com/hexojs/hexo-server/pull/100)

If you have access to the web server config, you should disable on-the-fly compression for static files (that are already compressed by this plugin),

- [nginx](https://github.com/google/ngx_brotli): Make sure both filter and static modules are enabled. This way pre-compressed `.br` files will be served while dynamic content can be compressed on-the-fly. Protip: `brotli_types text/plain text/css application/javascript application/json image/svg+xml application/xml+rss;` to prevent compressing media files (which are already compressed anyway).
- [Apache](https://httpd.apache.org/docs/2.4/en/mod/mod_brotli.html): See 'Serving pre-compressed content' section of [mod_brotli](https://httpd.apache.org/docs/2.4/en/mod/mod_brotli.html).
- [Caddy](https://caddyserver.com/features): [0.9.4+](https://caddyserver.com/blog/caddy-0_9_4-released) by default support pre-compressed `.gz` `.br` files and on-the-fly gzip compress dynamic files.
- [express](https://github.com/expressjs/express)/[connect](https://github.com/senchalabs/connect): Use [pre-compressed-assets](https://github.com/domadams/pre-compressed-assets). You still can continue to use [compression](https://github.com/expressjs/compression)/[shrink-ray-current](https://github.com/Alorel/shrink-ray) for dynamic files.

## Credits
All credits go to the following work:
- [hexo-neat](https://github.com/rozbo/hexo-neat) by rozbo
- gzip feature is inspired by [hexo-generator-optimize](https://github.com/JackyRen/hexo-generator-optimize)
