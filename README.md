# Hexo-yam

[![npm version](https://badge.fury.io/js/hexo-yam.svg)](https://www.npmjs.com/package/hexo-yam)
[![Build Status](https://travis-ci.com/weyusi/hexo-yam.svg?branch=master)](https://travis-ci.com/weyusi/hexo-yam)
[![NPM Dependencies](https://david-dm.org/weyusi/hexo-yam.svg)](https://david-dm.org/weyusi/hexo-yam)
[![Known Vulnerabilities](https://snyk.io/test/npm/hexo-yam/badge.svg)](https://snyk.io/test/npm/hexo-yam)
[![Greenkeeper badge](https://badges.greenkeeper.io/weyusi/hexo-yam.svg)](https://greenkeeper.io/)

> This project is based on [hexo-neat](https://github.com/rozbo/hexo-neat)

Yet Another Minifier for Hexo. Minify and compress (gzip) html, js and css.

The original package has not been [updated](https://www.npmjs.com/package/hexo-neat) for a while. Its outdated dependencies suffer from minor [vulnerability](https://snyk.io/test/npm/hexo-neat).

All the options are the same, so you can use this as a drop-in replacement.

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
- **logger** - Print log switch. Defaults to `true`.
- **exclude**: Exclude files
**Note:** For more options, see '[HTMLMinifier](https://github.com/kangax/html-minifier)'

----------

``` yaml
neat_css:
  enable: true
  exclude:
    - '*.min.css'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **logger** - Print log switch. Defaults to `true`.
- **exclude**: Exclude files

----------

``` yaml
neat_js:
  enable: true
  mangle: true
  output:
  compress:
  exclude:
    - '*.min.js'
```
- **enable** - Enable the plugin. Defaults to `true`.
- **mangle**: Mangle file names
- **logger** - Print log switch. Defaults to `true`.
- **output**: Output options
- **compress**: Compress options
- **exclude**: Exclude files
**Note:** For more options, see '[UglifyJS](https://github.com/mishoo/UglifyJS2)'

----------

``` yaml
gzip:
  enable: true
```
- **enable** - Enable the plugin. Defaults to `true`.

## Credits
All credits go to the following work:
- [hexo-neat](https://github.com/rozbo/hexo-neat) by rozbo
- neat html by [HTMLMinifier](https://github.com/kangax/html-minifier)
- neat css  by [clean-css](https://github.com/jakubpawlowicz/clean-css)
- neat js   by  [UglifyJS](http://lisperator.net/uglifyjs/)
- gzip inspired by [hexo-generator-optimize](https://github.com/JackyRen/hexo-generator-optimize)