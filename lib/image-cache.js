'use strict';

const ms        = require('ms');
const Catbox    = require('catbox');
const Package   = require('../package.json');

const internals = {};


internals.getKey = (filename) => ({
    id      : filename,
    segment : Package.name
});


const ImageCache = module.exports = function (engine, options) {

    if (!engine) {
        engine = require('catbox-memory');
        options = Object.assign(options || {}, { allowMixedContent: true });
    }

    this._ttl = options.expiresIn || ms('1h');
    this._cache = new Catbox.Client(engine, options);
};


ImageCache.prototype.get = function (filename) {

    const key = internals.getKey(filename);
    return new Promise((resolve, reject) => {

        this._cache.get(key, (err, cached) => {

            if (err) {
                return reject(err);
            }

            return resolve(cached && cached.item ? cached.item : null);
        });
    });
};


ImageCache.prototype.set = function (filename, data) {

    const key = internals.getKey(filename);
    return new Promise((resolve, reject) => {

        this._cache.set(key, data, this._ttl, (err) => err ? reject(err) : resolve(data));
    });
};


ImageCache.prototype.start = function () {

    return new Promise((resolve, reject) => {

        this._cache.start((err) => err ? reject(err) : resolve());
    });
};
