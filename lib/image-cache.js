'use strict';

const Catbox = require('catbox');
const Package = require('../package.json');


const ImageCache = function (strategy, ttl, options) {

    if (!strategy) {
        strategy = require('catbox-memory');
        options = options || {};
        options.allowMixedContent = true;
    }

    this._ttl = ttl;
    this._cache = new Catbox.Client(strategy, options);
};


ImageCache.prototype.get = function (filename, cacheMiss, callback) {

    const key = {
        id      : filename,
        segment : Package.name
    };

    // Default ttl (in milliseconds) = 1 hour
    const ttl = this._ttl || 60 * 60 * 1000;

    this._cache.get(key, (err, result) => {

        if (err) {
            return callback(err);
        }

        if (result && result.item) {
            return callback(null, result.item);
        }

        cacheMiss((err, data) => {

            if (err) {
                return callback(err);
            }

            this._cache.set(key, data, ttl, () => {});
            return callback(null, data);
        });
    });
};


ImageCache.prototype.start = function (callback) {

    this._cache.start(callback);
};


module.exports.init = function (strategy, ttl, options) {

    return new ImageCache(strategy, ttl, options);
};
