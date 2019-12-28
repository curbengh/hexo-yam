# hexo-yam

[![npm version](https://badge.fury.io/js/hexo-yam.svg)](https://www.npmjs.com/package/hexo-yam)
[![Build Status](https://travis-ci.com/curbengh/hexo-yam.svg?branch=master)](https://travis-ci.com/curbengh/hexo-yam)
[![NPM Dependencies](https://david-dm.org/curbengh/hexo-yam.svg)](https://david-dm.org/curbengh/hexo-yam)
[![Known Vulnerabilities](https://snyk.io/test/npm/hexo-yam/badge.svg)](https://snyk.io/test/npm/hexo-yam)
[![Greenkeeper badge](https://badges.greenkeeper.io/curbengh/hexo-yam.svg)](https://greenkeeper.io/)

Yet Another Minifier for Hexo. Minify and compress HTML, JS, CSS and SVG. XML, JSON and [many more](https://github.com/curbengh/hexo-yam/blob/ba77db0094a7c07ea9f70f010bfc15541d4105ca/index.js#L64) are also compressed. Support gzip and [brotli](https://en.wikipedia.org/wiki/Brotli) [compressions](https://en.wikipedia.org/wiki/HTTP_compression).

## Version 4
In v4, `logger:` option has been renamed to `verbose:`

Example:

``` yml
minify:
  html:
    logger: true
```

needs to be updated to

``` yml
minify:
  html:
    verbose: true
```

## Installation
``` bash
$ npm install hexo-yam --save
```

## Options

``` yaml
minify:
  enable: true
```

- **enable** - Enable the plugin. Defaults to `true`.

---

``` yaml
minify:
  html:
    enable: true
    exclude:
```
- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Plugin's priority. Defaults to `10`. Set lower value to set higher priority and vice versa.
- **verbose** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files.
  - Support one-liner, `exclude: [*.min.html, *.note.html]`.
  - Test glob pattern on the web using [Globtester](http://www.globtester.com/).
- **globOptions** - [micromatch options](https://github.com/micromatch/micromatch#options) to customise how glob patterns match files.
  - Defaults to `{ basename: true }`, unless the pattern has a slash.
    - basename is disabled depending on each pattern.
    - When specifying an array of patterns, e.g. `exclude: ['*foo.html', '**/bar.html']`, basename applies to `'*foo.html'`, but not `'**/bar.html'`.
    - basename would stay disabled, if explicitly disabled in `globOptions:`.
    - However, basename option applies to all patterns in `include:`

For more options, see [HTMLMinifier](https://github.com/kangax/html-minifier).

---

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
- **exclude** - Exclude files. Support wildcard pattern.
- **level** - Optimization level. Defaults to `2`.
- **globOptions** - See [`html:`](#options).

For more options, see [clean-css](https://github.com/jakubpawlowicz/clean-css).

---

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
- **exclude** - Exclude files. Support wildcard pattern.
- **compress** - Compress options.
- **mangle** - Mangle variable names. Defaults to `true`. Pass an object to specify [mangle options](https://github.com/terser-js/terser#mangle-options).
- **output** - Output options.
  - To retain comments, `output: {comments: true}`.
- **globOptions** - See [`html:`](#options).

For more options, see [Terser](https://github.com/terser-js/terser).

---

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
- **include** - Include files. Support wildcard pattern.
  - Exclude `*.min.svg` by default.
- **plugins** - Plugin options.
  - To retain comments, `plugins: [{removeComments: false}]`.
  - For more options, see [svgo](https://github.com/svg/svgo).
- **globOptions** - See [`html:`](#options).

---

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
- **include** - Include files. Support wildcard pattern.
  - Support one-liner, `include: ['*.html','*.css','*.js']`.
  - Must include asterisk and single quotes. `.html` is invalid. `'*.html'` is valid.
- **globOptions** - See [`html:`](#options).
- **level** - Compression level; lower value may results in faster compression but slightly larger (compressed) file. Range `1-9`. Defaults to `9`, or the value of [`zlib.constants.Z_BEST_COMPRESSION`](https://nodejs.org/docs/latest-v12.x/api/zlib.html#zlib_zlib_constants)

---

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
- **include** - Include files. Support wildcard pattern.
- **globOptions** - See [`html:`](#options).
- **level** - Compression level. Range `1-11`. Defaults to `11`, or the value of [`zlib.constants.BROTLI_MAX_QUALITY`](https://nodejs.org/docs/latest-v12.x/api/zlib.html#zlib_brotli_constants)

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
