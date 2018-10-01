/* global hexo */
'use strict';
var CleanCSS = require('clean-css'),
    UglifyJS = require('uglify-js'),
    Htmlminifier = require('html-minifier').minify,
    streamToArray = require('stream-to-array');
var Promise = require('bluebird');
var minimatch = require('minimatch');
var fs = require('hexo-fs');
var zlib = require('zlib');
var br = require('iltorb');

function logic_html(str, data) {
    var hexo = this,
        options = hexo.config.neat_html;
    // Return if disabled.
    if (false === options.enable) return;

    var path = data.path;
    var exclude = options.exclude;
    if (exclude && !Array.isArray(exclude)) exclude = [exclude];

    if (path && exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            if (minimatch(path, exclude[i], {matchBase: true})) return str;
        }
    }

    var result = Htmlminifier(str, options);
    var saved = ((str.length - result.length) / str.length * 100).toFixed(2);
    if (options.logger) {
        var log = hexo.log || console.log;
        log.log('Minify the html: %s [%s saved]', path, saved + '%');
    }
    return result;
}

function logic_css(str, data) {
    var hexo = this,
        options = hexo.config.neat_css;
    // Return if disabled.
    if (false === options.enable) return;

    var path = data.path;
    var exclude = options.exclude;
    if (exclude && !Array.isArray(exclude)) exclude = [exclude];

    if (path && exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            if (minimatch(path, exclude[i], {matchBase: true})) return str;
        }
    }

    return new Promise(function (resolve, reject) {
        new CleanCSS(options).minify(str, function (err, result) {
            if (err) return reject(err);
            var saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2);
            resolve(result.styles);
            if (options.logger) {
                var log = hexo.log || console.log;
                log.log('Minify the css: %s [%s saved]', path, saved + '%');
            }
        });
    });
}

function logic_js(str, data) {
    var hexo = this,
        options = hexo.config.neat_js;
    // Return if disabled.
    if (false === options.enable) return;

    var path = data.path;
    var exclude = options.exclude;
    if (exclude && !Array.isArray(exclude)) exclude = [exclude];

    if (path && exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            if (minimatch(path, exclude[i], {matchBase: true})) return str;
        }
    }

    //uglifyjs doesn't like unsupported options
    delete options.enable;
    delete options.exclude;
    var js_logger = options.logger;
    delete options.logger;

    var result = UglifyJS.minify(str, options);
    var saved = ((str.length - result.code.length) / str.length * 100).toFixed(2);
    if (js_logger) {
        var log = hexo.log || console.log;
        log.log('Minify the js: %s [%s saved]', path, saved + '%');
    }
    return result.code;
}

function logic_gzip() {
    var hexo = this,
        options = hexo.config.neat_gzip;
    // Return if disabled.
    if (false === options.enable) return;

    var publicFolder = hexo.public_dir;

    var compressFile = function (currentPath) {
      var fileExist = fs.existsSync(currentPath);
      if (fileExist) {
        var files = fs.listDirSync(currentPath);
        for (var i in files) {
          var currentFile = currentPath + files[i];
          var stats = fs.statSync(currentFile);
          if (stats.isFile()) {
            if(currentFile.endsWith(".htm") ||
                currentFile.endsWith(".html") ||
                currentFile.endsWith(".js") ||
                currentFile.endsWith(".css") ||
                currentFile.endsWith(".txt")) {
              var inp = fs.createReadStream(currentFile);
              var out = fs.createWriteStream(currentFile+'.gz');
              var gzip = zlib.createGzip('level=9');
              inp.pipe(gzip).pipe(out);

              if (options.logger) {
                var log = hexo.log || console.log;
                log.log('Gzipped the file: %s', currentFile);
              }
            }
          } else if (stats.isDirectory()) {
            compressFile(currentFile);
          }
        }
      }
    }
    compressFile(publicFolder);
}

function logic_brotli() {
    var hexo = this,
        options = hexo.config.neat_brotli;
    // Return if disabled.
    if (false === options.enable) return;

    var publicFolder = hexo.public_dir;

    var compressFile = function (currentPath) {
      var fileExist = fs.existsSync(currentPath);
      if (fileExist) {
        var files = fs.listDirSync(currentPath);
        for (var i in files) {
          var currentFile = currentPath + files[i];
          var stats = fs.statSync(currentFile);
          if (stats.isFile()) {
            if(currentFile.endsWith(".htm") ||
                currentFile.endsWith(".html") ||
                currentFile.endsWith(".js") ||
                currentFile.endsWith(".css") ||
                currentFile.endsWith(".txt")) {
              var inp = fs.createReadStream(currentFile);
              var out = fs.createWriteStream(currentFile+'.br');
              var brotli = br.compressStream('quality=16');
              inp.pipe(brotli()).pipe(out);

              if (options.logger) {
                var log = hexo.log || console.log;
                log.log('Brotli-ed the file: %s', currentFile);
              }
            }
          } else if (stats.isDirectory()) {
            compressFile(currentFile);
          }
        }
      }
    }
    compressFile(publicFolder);
}

module.exports = {
    logic_html: logic_html,
    logic_css: logic_css,
    logic_js: logic_js,
    logic_gzip: logic_gzip,
    logic_brotli: logic_brotli
};
