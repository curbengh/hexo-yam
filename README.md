# Hexo-yam

[![npm version](https://badge.fury.io/js/hexo-yam.svg)](https://www.npmjs.com/package/hexo-yam)
[![Build Status](https://travis-ci.com/weyusi/hexo-yam.svg?branch=master)](https://travis-ci.com/weyusi/hexo-yam)
[![NPM Dependencies](https://david-dm.org/weyusi/hexo-yam.svg)](https://david-dm.org/weyusi/hexo-yam)
[![Known Vulnerabilities](https://snyk.io/test/npm/hexo-yam/badge.svg)](https://snyk.io/test/npm/hexo-yam)
[![Greenkeeper badge](https://badges.greenkeeper.io/weyusi/hexo-yam.svg)](https://greenkeeper.io/)

> This project is based on [hexo-neat](https://github.com/rozbo/hexo-neat)

Yet Another Minifier for Hexo. Minify and compress html, js and css. xml, json and [many more](https://github.com/weyusi/hexo-yam/blob/master/lib/filter.js#L105) are also compressed. Support gzip and [brotli](https://en.wikipedia.org/wiki/Brotli) [compressions](https://en.wikipedia.org/wiki/HTTP_compression).

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
- **exclude** - Exclude files. Support [wildcard](https://github.com/micromatch/nanomatch#features) glob pattern.
  - It can be specified as a one-liner, `[*.min.html, *.note.html]`.
  - To exclude a file, double asterisk and the full path must be specified, `**/themes/typing/source/js/source.js`.
  - `*source.js` also works, but it also excludes `resource.js`.
  - Test glob pattern on the web using [Globtester](http://www.globtester.com/).

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
- **mangle** - Mangle file names. Defaults to `true`.
- **output** - Output options.
- **compress** - Compress options.

For more options, see [Terser](https://github.com/terser-js/terser).

----------

``` yaml
neat_gzip:
  enable: true
```
- **enable** - Enable the plugin. Defaults to `true`.
- **logger** - Verbose output. Defaults to `false`.

----------

``` yaml
neat_brotli:
  enable: true
```
- **enable** - Enable the plugin. Defaults to `true`.
- **logger** - Verbose output. Defaults to `false`.

## HTTP Compression
While most modern web browsers [support](https://www.caniuse.com/#feat=brotli) Brotli, you also need to consider whether the web/app server, hosting platform, reverse proxy or CDN (whichever relevant to you) support it.

As of 2018, GitHub/GitLab Pages and Netlify *do not* support brotli. You can generate `.br` files, but they won't be serving those files.

If you have access to the web server config, you should disable on-the-fly compression for static files (that are already compressed by this plugin), e.g.

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
