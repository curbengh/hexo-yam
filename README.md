# Hexo-yam

[![npm version](https://badge.fury.io/js/hexo-yam.svg)](https://www.npmjs.com/package/hexo-yam)
[![Build Status](https://travis-ci.com/weyusi/hexo-yam.svg?branch=master)](https://travis-ci.com/weyusi/hexo-yam)
[![NPM Dependencies](https://david-dm.org/weyusi/hexo-yam.svg)](https://david-dm.org/weyusi/hexo-yam)
[![Known Vulnerabilities](https://snyk.io/test/npm/hexo-yam/badge.svg)](https://snyk.io/test/npm/hexo-yam)
[![Greenkeeper badge](https://badges.greenkeeper.io/weyusi/hexo-yam.svg)](https://greenkeeper.io/)

> This project is based on [hexo-neat](https://github.com/rozbo/hexo-neat)

Yet Another Minifier for Hexo. Minify and compress html, js, css and svg. xml, json and [many more](https://github.com/weyusi/hexo-yam/blob/master/lib/filter.js#L105) are also compressed. Support gzip and [brotli](https://en.wikipedia.org/wiki/Brotli) [compressions](https://en.wikipedia.org/wiki/HTTP_compression).

The original package has not been [updated](https://www.npmjs.com/package/hexo-neat) for a while. I update the [dependencies](https://github.com/weyusi/hexo-yam/blob/master/package.json) and add compression support.

All the options are the same, so you can use this as a drop-in replacement.

*Note:* See [HTTP Compression](#http-compression) section below for more info on using brotli.

## Installation
``` bash
$ npm install hexo-yam --save
```

## Usage
To enable this plugin, insert the following to `_config.yml`:
``` yaml
neat_enable: true
```
For further customization, see below.

## Options
``` yaml
neat_html:
  enable: true
  exclude:
```
- **enable** - Enable the plugin. Defaults to `true`.
- **logger** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files.
  - Support one-liner, `exclude: [*.min.html, *.note.html]`.
  - To exclude a file, double asterisk and the full path must be specified, `**/themes/typing/source/js/source.js`.
  - `*source.js` also works, but it also excludes `resource.js`.
  - Test glob pattern on the web using [Globtester](http://www.globtester.com/).
- **globOptions** - [micromatch options](https://github.com/micromatch/micromatch#options) to customise how glob patterns match files. Defaults to `{ matchBase: true }`.

For more options, see [HTMLMinifier](https://github.com/kangax/html-minifier).

----------

``` yaml
neat_css:
  enable: true
  exclude:
    - '*.min.css'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **logger** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files. Support wildcard pattern.
- **level** - Optimization level. Defaults to `2`.
- **globOptions** - [micromatch options](https://github.com/micromatch/micromatch#options) to customise how glob patterns match files. Defaults to `{ matchBase: true }`.

For more options, see [clean-css](https://github.com/jakubpawlowicz/clean-css).

----------

``` yaml
neat_js:
  enable: true
  exclude:
    - '*.min.js'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **logger** - Verbose output. Defaults to `false`.
- **exclude** - Exclude files. Support wildcard pattern.
- **compress** - Compress options.
- **mangle** - Mangle variable names. Defaults to `true`. Pass an object to specify [mangle options](https://github.com/terser-js/terser#mangle-options).
- **output** - Output options.
  - To retain comments, `output: {comments: true}`.
- **globOptions** - [micromatch options](https://github.com/micromatch/micromatch#options) to customise how glob patterns match files. Defaults to `{ matchBase: true }`.

For more options, see [Terser](https://github.com/terser-js/terser).

----------

``` yaml
neat_svg:
  enable: true
  include:
    - '*.svg'
    - '!*.min.svg'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **logger** - Verbose output. Defaults to `false`.
- **include** - Include files. Support wildcard pattern.
  - Exclude `*.min.svg` by default.
- **plugins** - Plugin options.
  - To retain comments, `plugins: [{removeComments: false}]`.
- **globOptions** - [micromatch options](https://github.com/micromatch/micromatch#options) to customise how glob patterns match files. Defaults to `{ matchBase: true }`.

For more options, see [svgo](https://github.com/svg/svgo).

----------

``` yaml
neat_gzip:
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
- **logger** - Verbose output. Defaults to `false`.
- **include** - Include files. Support wildcard pattern.
  - Support one-liner, `include: ['*.html','*.css','*.js']`.
  - Must include asterisk and single quotes. `.html` is invalid. `'*.html'` is valid.
- **globOptions** - [micromatch options](https://github.com/micromatch/micromatch#options) to customise how glob patterns match files. Defaults to `{ matchBase: true }`.

----------

``` yaml
neat_brotli:
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
- **logger** - Verbose output. Defaults to `false`.
- **include** - Include files. Support wildcard pattern.
- **globOptions** - [micromatch options](https://github.com/micromatch/micromatch#options) to customise how glob patterns match files. Defaults to `{ matchBase: true }`.

## HTTP Compression
While most modern web browsers [support Brotli](https://www.caniuse.com/#feat=brotli), you also need to consider whether the web/app server, hosting platform, reverse proxy or CDN (whichever relevant to you) support it.

As of May 2019, GitHub Pages, GitLab Pages and Netlify *do not* support brotli yet. You can generate `.br` files, but they won't serve those files.

Name | Status (May 8, 2019)
--- | ---
GitHub Pages | [In consideration](https://github.community/t5/GitHub-Pages/Support-for-pre-compressed-assets-and-brotli-compression/m-p/22055)
GitLab Pages | [In progress](https://gitlab.com/gitlab-org/gitlab-pages/merge_requests/120)
Netlify | [In consideration](https://postimg.cc/qgxn0261)

If you have access to the web server config, you should disable on-the-fly compression for static files (that are already compressed by this plugin),

- [nginx](https://github.com/google/ngx_brotli): Make sure both filter and static modules are enabled. This way pre-compressed `.br` files will be served while dynamic content can be compressed on-the-fly. Protip: `brotli_types text/plain text/css application/javascript application/json image/svg+xml application/xml+rss;` to prevent compressing media files (which are already compressed anyway).
- [Apache](https://httpd.apache.org/docs/2.4/en/mod/mod_brotli.html): See 'Serving pre-compressed content' section of [mod_brotli](https://httpd.apache.org/docs/2.4/en/mod/mod_brotli.html).
- [Caddy](https://caddyserver.com/features): [0.9.4+](https://caddyserver.com/blog/caddy-0_9_4-released) by default support pre-compressed `.gz` `.br` files and on-the-fly gzip compress dynamic files.
- [express](https://github.com/expressjs/express)/[connect](https://github.com/senchalabs/connect): Use [pre-compressed-assets](https://github.com/domadams/pre-compressed-assets). You still can continue to use [compression](https://github.com/expressjs/compression)/[shrink-ray-current](https://github.com/Alorel/shrink-ray) for dynamic files.

## Credits
All credits go to the following work:
- [hexo-neat](https://github.com/rozbo/hexo-neat) by rozbo
- neat html by [HTMLMinifier](https://github.com/kangax/html-minifier)
- neat css  by [clean-css](https://github.com/jakubpawlowicz/clean-css)
- neat js   by  [terser](https://github.com/terser-js/terser)
- gzip feature is inspired by [hexo-generator-optimize](https://github.com/JackyRen/hexo-generator-optimize)
