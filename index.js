/*jslint node: true */
"use strict";

var formidable = require('formidable'),
    qs = require('qs');


function mime(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
}

/**
 * octetStream: mostly nicked from connect's multipart.js
 *
 * Parse application/octet-stream request bodies,
 * providing the parsed object as `req.body`
 * and `req.files`.
 *
 * Configuration:
 *
 *  The options passed are merged with [formidable](https://github.com/felixge/node-formidable)'s
 *  `IncomingForm` object, allowing you to configure the upload directory,
 *  size limits, etc. For example if you wish to change the upload dir do the following.
 *
 *     app.use(fineuploaderExpressMiddleware({ uploadDir: path }));
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  options = options || {};

  return function octetStream(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};
    req.files = req.files || {};

    // ignore GET
    if ('GET' == req.method || 'HEAD' == req.method) return next();

    // check Content-Type
    if ('application/octet-stream' !== mime(req)) return next();

    // flag as parsed
    req._body = true;

    // parse

    var form = new formidable.IncomingForm(),
        files = {},
        done;

    Object.keys(options).forEach(function(key){
      form[key] = options[key];
    });

    function ondata(name, val, data){
      if (Array.isArray(data[name])) {
        data[name].push(val);
      } else if (data[name]) {
        data[name] = [data[name], val];
      } else {
        data[name] = val;
      }
    }

    form.on('file', function(name, val){
      ondata(name, val, files);
    });

    form.on('error', function(err){
      if (!options.defer) {
        err.status = 400;
        next(err);
      }
      done = true;
    });

    form.on('end', function(){
      if (done) return;
      try {
        req.body = null;
        req.files = qs.parse(files);
        if (!options.defer) next();
      } catch (err) {
        form.emit('error', err);
      }
    });

    form.parse(req);

    if (options.defer) {
      req.form = form;
      next();
    }

  };
};
